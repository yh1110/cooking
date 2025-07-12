"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
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

export async function generateMealPlan(ingredients: string[]) {
	try {
		const { object } = await generateObject({
			model: openai("gpt-4o"),
			schema: mealPlanSchema,
			prompt: `
        以下の食材を使って、栄養バランスの良い1日の献立（朝食、昼食、夕食）を提案してください。

        利用可能な食材: ${ingredients.join(", ")}

        要件:
        - 各食事で提供された食材を可能な限り活用する
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
      `,
		});

		return object;
	} catch (error) {
		console.error("AI献立生成エラー:", error);
		throw new Error("献立の生成に失敗しました");
	}
}
