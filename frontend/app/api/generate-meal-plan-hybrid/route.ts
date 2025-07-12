import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const mealPlanSchema = z.object({
	breakfast: z.object({
		name: z.string().describe("朝食の料理名"),
		ingredients: z.array(z.string()).describe("使用する食材のリスト"),
		cookingTime: z.string().describe("調理時間（例：15分）"),
		calories: z.string().describe("カロリー（例：350kcal）"),
		description: z.string().describe("料理の簡単な説明"),
	}),
	lunch: z.object({
		name: z.string().describe("昼食の料理名"),
		ingredients: z.array(z.string()).describe("使用する食材のリスト"),
		cookingTime: z.string().describe("調理時間（例：20分）"),
		calories: z.string().describe("カロリー（例：550kcal）"),
		description: z.string().describe("料理の簡単な説明"),
	}),
	dinner: z.object({
		name: z.string().describe("夕食の料理名"),
		ingredients: z.array(z.string()).describe("使用する食材のリスト"),
		cookingTime: z.string().describe("調理時間（例：30分）"),
		calories: z.string().describe("カロリー（例：650kcal）"),
		description: z.string().describe("料理の簡単な説明"),
	}),
	nutritionSummary: z.object({
		totalCalories: z.string().describe("1日の総カロリー"),
		protein: z.string().describe("タンパク質の総量（例：65g）"),
		carbs: z.string().describe("炭水化物の総量（例：180g）"),
		fat: z.string().describe("脂質の総量（例：45g）"),
	}),
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const imageFile = formData.get("image") as File | null;
		const ingredientsStr = formData.get("ingredients") as string | null;

		// Parse ingredients from JSON string if provided
		let ingredients: string[] = [];
		if (ingredientsStr) {
			try {
				ingredients = JSON.parse(ingredientsStr);
			} catch (error) {
				console.log("食材リストのJSON解析エラー:", error);
				return NextResponse.json({ error: "食材リストの形式が正しくありません" }, { status: 400 });
			}
		}

		// Validate that at least one input method is provided
		if (!imageFile && (!ingredients || ingredients.length === 0)) {
			return NextResponse.json(
				{ error: "画像または食材リストのどちらかは必要です" },
				{ status: 400 }
			);
		}

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// Build prompt based on available inputs
		let prompt = `
      栄養バランスの良い1日の献立（朝食、昼食、夕食）を提案してください。
      必ずJSON形式で回答してください。

      利用可能な情報:
    `;

		// Add text ingredients if provided
		if (ingredients && ingredients.length > 0) {
			prompt += `\n      テキストで入力された食材: ${ingredients.join(", ")}`;
		}

		// Add image information if provided
		if (imageFile) {
			prompt += `\n      画像: 添付の画像から食材を認識してください`;
		}

		prompt += `

      要件:
      - 提供された全ての食材情報（テキストと画像の両方）を活用する
      - 画像がある場合は、画像から食材を正確に識別する
      - テキストで提供された食材も必ず考慮に入れる
      - 栄養バランスを考慮する（タンパク質、炭水化物、脂質、ビタミン、ミネラル）
      - 日本の家庭料理を中心とする
      - 調理時間は現実的な範囲で設定する
      - カロリーは成人の1日の摂取目安（1800-2200kcal）を考慮する
      - 各料理には簡潔で魅力的な説明を付ける
      - 足りない食材がある場合は、一般的な調味料や基本的な食材（米、卵、調味料など）を追加して良い

      栄養バランスの目安:
      - タンパク質: 体重1kgあたり1-1.2g
      - 炭水化物: 総カロリーの50-60%
      - 脂質: 総カロリーの20-30%

      JSON形式の例:
      {
        "breakfast": {
          "name": "和風オムレツ",
          "ingredients": ["卵", "玉ねぎ", "醤油"],
          "cookingTime": "15分",
          "calories": "350kcal",
          "description": "ふわふわの卵に玉ねぎの甘味がマッチした和風オムレツ"
        },
        "lunch": {
          "name": "チキン野菜炒め",
          "ingredients": ["鶏肉", "人参", "ピーマン"],
          "cookingTime": "20分",
          "calories": "550kcal",
          "description": "彩り豊かな野菜と鶏肉のヘルシー炒め"
        },
        "dinner": {
          "name": "豚の生姜焼き",
          "ingredients": ["豚肉", "玉ねぎ", "生姜"],
          "cookingTime": "25分",
          "calories": "650kcal",
          "description": "ご飯が進む定番の生姜焼き"
        },
        "nutritionSummary": {
          "totalCalories": "1550kcal",
          "protein": "65g",
          "carbs": "180g",
          "fat": "45g"
        }
      }
    `;

		let result;

		if (imageFile) {
			// Convert file to base64 if image is provided
			const bytes = await imageFile.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const base64Image = buffer.toString("base64");
			const mimeType = imageFile.type;

			const imagePart = {
				inlineData: {
					data: base64Image,
					mimeType: mimeType,
				},
			};

			result = await model.generateContent([prompt, imagePart]);
		} else {
			// Text-only mode
			result = await model.generateContent(prompt);
		}

		const response = result.response;
		const text = response.text();

		// JSONの抽出
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("JSONレスポンスが見つかりません");
		}

		const parsedResponse = JSON.parse(jsonMatch[0]);
		const validatedResponse = mealPlanSchema.parse(parsedResponse);

		return NextResponse.json(validatedResponse);
	} catch (error) {
		console.error("ハイブリッドAI献立生成エラー:", error);
		return NextResponse.json({ error: "ハイブリッド献立生成に失敗しました" }, { status: 500 });
	}
}
