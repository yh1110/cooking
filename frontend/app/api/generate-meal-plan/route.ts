import OpenAI from "openai";
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

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
	try {
		const { ingredients } = await request.json();

		if (!ingredients || !Array.isArray(ingredients)) {
			return NextResponse.json({ error: "食材のリストが必要です" }, { status: 400 });
		}


		const prompt = `
      以下の食材を使って、栄養バランスの良い1日の献立（朝食、昼食、夕食）を提案してください。
      必ずJSON形式のみで回答してください。

      利用可能な食材: ${ingredients.join(", ")}

      要件:
      - 各食事で提供された食材を可能な限り活用する
      - 栄養バランスを考慮する（タンパク質、炭水化物、脂質、ビタミン、ミネラル）
      - 日本の家庭料理を中心とする
      - 調理時間は現実的な範囲で設定するs
      - カロリーは成人の1日の摂取目安（1800-2200kcal）を考慮する
      - 各料理には簡潔で魅力的な説明を付ける
      - 足りない食材がある場合は、一般的な調味料や基本的な食材（米、卵、調味料など）を追加して良い
      - 各料理のimageプロパティには料理の雰囲気に沿った画像を生成してURLとして記載すること

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
          "description": "ふわふわの卵に玉ねぎの甘味がマッチした和風オムレツ",
          "image": "(画像のURL)"
        },
        "lunch": {
          "name": "チキン野菜炒め",
          "ingredients": ["鶏肉", "人参", "ピーマン"],
          "cookingTime": "20分",
          "calories": "550kcal",
          "description": "彩り豊かな野菜と鶏肉のヘルシー炒め",
          "image": "(画像のURL)"
        },
        "dinner": {
          "name": "豚の生姜焼き",
          "ingredients": ["豚肉", "玉ねぎ", "生姜"],
          "cookingTime": "25分",
          "calories": "650kcal",
          "description": "ご飯が進む定番の生姜焼き",
          "image": "(画像のURL)"
        },
        "nutritionSummary": {
          "totalCalories": "1550kcal",
          "protein": "65g",
          "carbs": "180g",
          "fat": "45g"
        }
      }
    `;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
		});

		const text = completion.choices[0]?.message?.content || "";

		// JSONの抽出
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("JSONレスポンスが見つかりません");
		}

		const parsedResponse = JSON.parse(jsonMatch[0]);
		const validatedResponse = mealPlanSchema.parse(parsedResponse);

		return NextResponse.json(validatedResponse);
	} catch (error) {
		console.error("AI献立生成エラー:", error);
		return NextResponse.json({ error: "献立の生成に失敗しました" }, { status: 500 });
	}
}
