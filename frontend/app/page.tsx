"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  ChefHat,
  Clock,
  Heart,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Loader2,
  Upload,
  Type,
  Camera,
} from "lucide-react"
import { generateMealPlan } from "./actions/generate-meal-plan"
import { generateMealPlanFromImage } from "./actions/generate-meal-plan-from-image"

interface MealPlan {
  breakfast: {
    name: string
    ingredients: string[]
    cookingTime: string
    calories: string
    description: string
  }
  lunch: {
    name: string
    ingredients: string[]
    cookingTime: string
    calories: string
    description: string
  }
  dinner: {
    name: string
    ingredients: string[]
    cookingTime: string
    calories: string
    description: string
  }
  nutritionSummary: {
    totalCalories: string
    protein: string
    carbs: string
    fat: string
  }
}

export default function MealPlannerApp() {
  const [inputMode, setInputMode] = useState<"text" | "image">("text")
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMealPlan, setGeneratedMealPlan] = useState<MealPlan | null>(null)

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((item) => item !== ingredient))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateMealPlan = async () => {
    if (inputMode === "text" && ingredients.length === 0) return
    if (inputMode === "image" && !uploadedImage) return

    setIsGenerating(true)
    try {
      let result: MealPlan
      if (inputMode === "text") {
        result = await generateMealPlan(ingredients)
      } else {
        const formData = new FormData()
        formData.append("image", uploadedImage!)
        result = await generateMealPlanFromImage(formData)
      }
      setGeneratedMealPlan(result)
    } catch (error) {
      console.error("献立生成エラー:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const resetInputs = () => {
    setIngredients([])
    setCurrentIngredient("")
    setUploadedImage(null)
    setImagePreview(null)
    setGeneratedMealPlan(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  AI献立プランナー
                </h1>
                <p className="text-xs text-muted-foreground">食材からAIが献立を提案</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>田中</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Input Mode Selection */}
        <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI献立を生成する方法を選択
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setInputMode("text")
                  resetInputs()
                }}
                variant={inputMode === "text" ? "secondary" : "outline"}
                className={`flex-1 ${
                  inputMode === "text"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                <Type className="w-4 h-4 mr-2" />
                テキストで入力
              </Button>
              <Button
                onClick={() => {
                  setInputMode("image")
                  resetInputs()
                }}
                variant={inputMode === "image" ? "secondary" : "outline"}
                className={`flex-1 ${
                  inputMode === "image"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                <Camera className="w-4 h-4 mr-2" />
                画像をアップロード
              </Button>
            </div>

            {/* Text Input Mode */}
            {inputMode === "text" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="食材を入力してください（例：鶏肉、玉ねぎ、人参）"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                  <Button
                    onClick={addIngredient}
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        {ingredient}
                        <button onClick={() => removeIngredient(ingredient)} className="ml-2 hover:text-red-200">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image Upload Mode */}
            {inputMode === "image" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="アップロード画像"
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        onClick={() => {
                          setUploadedImage(null)
                          setImagePreview(null)
                        }}
                        variant="secondary"
                        className="bg-white text-purple-600 hover:bg-white/90"
                      >
                        画像を変更
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-white/70" />
                      <div>
                        <p className="text-white/90 mb-2">冷蔵庫や食材の画像をアップロード</p>
                        <p className="text-white/70 text-sm">JPG, PNG, WebP形式に対応</p>
                      </div>
                      <label htmlFor="image-upload">
                        <Button variant="secondary" className="bg-white text-purple-600 hover:bg-white/90" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            画像を選択
                          </span>
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            {((inputMode === "text" && ingredients.length > 0) || (inputMode === "image" && uploadedImage)) && (
              <Button
                onClick={handleGenerateMealPlan}
                disabled={isGenerating}
                variant="secondary"
                className="w-full bg-white text-purple-600 hover:bg-white/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI献立を生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI献立を生成
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Generated Meal Plan */}
        {generatedMealPlan ? (
          <div className="space-y-6">
            {/* Generated Meals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">AI生成献立</h2>
                <Button
                  onClick={resetInputs}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  新しい献立を作成
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Breakfast */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=120&width=200"
                        alt={generatedMealPlan.breakfast.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white">朝食</Badge>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{generatedMealPlan.breakfast.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {generatedMealPlan.breakfast.cookingTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {generatedMealPlan.breakfast.calories}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{generatedMealPlan.breakfast.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedMealPlan.breakfast.ingredients.slice(0, 3).map((ingredient, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {generatedMealPlan.breakfast.ingredients.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{generatedMealPlan.breakfast.ingredients.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lunch */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=120&width=200"
                        alt={generatedMealPlan.lunch.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white">昼食</Badge>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{generatedMealPlan.lunch.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {generatedMealPlan.lunch.cookingTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {generatedMealPlan.lunch.calories}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{generatedMealPlan.lunch.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedMealPlan.lunch.ingredients.slice(0, 3).map((ingredient, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {generatedMealPlan.lunch.ingredients.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{generatedMealPlan.lunch.ingredients.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dinner */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=120&width=200"
                        alt={generatedMealPlan.dinner.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-purple-500 text-white">夕食</Badge>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{generatedMealPlan.dinner.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {generatedMealPlan.dinner.cookingTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {generatedMealPlan.dinner.calories}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{generatedMealPlan.dinner.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedMealPlan.dinner.ingredients.slice(0, 3).map((ingredient, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {generatedMealPlan.dinner.ingredients.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{generatedMealPlan.dinner.ingredients.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Nutrition Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">栄養バランス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {generatedMealPlan.nutritionSummary.totalCalories}
                    </div>
                    <div className="text-sm text-muted-foreground">カロリー</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{generatedMealPlan.nutritionSummary.protein}</div>
                    <div className="text-sm text-muted-foreground">タンパク質</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{generatedMealPlan.nutritionSummary.carbs}</div>
                    <div className="text-sm text-muted-foreground">炭水化物</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{generatedMealPlan.nutritionSummary.fat}</div>
                    <div className="text-sm text-muted-foreground">脂質</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {inputMode === "text"
                  ? "食材を入力してAI献立を生成しましょう"
                  : "画像をアップロードしてAI献立を生成しましょう"}
              </h3>
              <p className="text-muted-foreground">
                {inputMode === "text"
                  ? "冷蔵庫にある食材を入力すると、AIが栄養バランスを考慮した献立を提案します"
                  : "冷蔵庫や食材の画像をアップロードすると、AIが食材を認識して献立を提案します"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
