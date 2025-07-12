"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
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
  Zap,
  Star,
  Award,
  Utensils,
  Moon,
  Sun,
} from "lucide-react"

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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10])
  
  const [heroRef, heroInView] = useInView({ threshold: 0.1 })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 })
  
  useEffect(() => {
    setMounted(true)
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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
    if (inputMode === "text" && ingredients.length === 0) return;
    if (inputMode === "image" && !uploadedImage) return;

    setIsGenerating(true);
    try {
      let result: MealPlan;
      if (inputMode === "text") {
        const response = await fetch("/api/generate-meal-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients }),
        });
        
        if (!response.ok) {
          throw new Error("献立の生成に失敗しました");
        }
        
        result = await response.json();
      } else {
        const formData = new FormData();
        formData.append("image", uploadedImage!);
        
        const response = await fetch("/api/generate-meal-plan-from-image", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error("画像からの献立生成に失敗しました");
        }
        
        result = await response.json();
      }
      setGeneratedMealPlan(result);
    } catch (error) {
      console.error("献立生成エラー:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetInputs = () => {
    setIngredients([]);
    setCurrentIngredient("");
    setUploadedImage(null);
    setImagePreview(null);
    setGeneratedMealPlan(null);
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-red-50'}`}>
      {/* Enhanced Header with Scroll Effects */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors duration-300"
      >
        <motion.div 
          style={{ filter: `blur(${headerBlur}px)` }}
          className="container mx-auto px-4 py-4"
        >
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg"
              >
                <ChefHat className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                >
                  AI献立プランナー
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  食材からAIが栄養バランス抜群の献立を提案
                </motion.p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleDarkMode}
                  className="relative overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-10 h-10 ring-2 ring-orange-500/20">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">田中</AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <motion.div 
          ref={heroRef}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 py-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={heroInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 blur-xl"
              />
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-3xl">
                <Utensils className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight"
          >
            AI が創る<br />美味しい毎日
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            冷蔵庫の食材や写真から、栄養バランスを考慮した献立を瞬時に生成。
            <br />料理の悩みを解決し、健康的な食生活をサポートします。
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {["栄養バランス計算", "カロリー管理", "食材ロス削減", "時短レシピ"].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-orange-200 dark:border-gray-700"
              >
                <Star className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Input Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="absolute inset-0 bg-black/10" />
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]"
            />
            
            <div className="relative text-white">
              <CardHeader className="pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    AI献立を生成する方法を選択
                  </CardTitle>
                  <p className="text-white/80 mt-2">お好みの方法で食材情報を入力してください</p>
                </motion.div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Enhanced Mode Selection Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        setInputMode("text")
                        resetInputs()
                      }}
                      variant={inputMode === "text" ? "secondary" : "outline"}
                      className={`w-full h-20 text-lg font-semibold transition-all duration-300 ${
                        inputMode === "text"
                          ? "bg-white text-purple-600 shadow-lg scale-105"
                          : "bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Type className="w-6 h-6" />
                        <span>テキストで入力</span>
                        <span className="text-xs opacity-80">食材名を直接入力</span>
                      </div>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        setInputMode("image")
                        resetInputs()
                      }}
                      variant={inputMode === "image" ? "secondary" : "outline"}
                      className={`w-full h-20 text-lg font-semibold transition-all duration-300 ${
                        inputMode === "image"
                          ? "bg-white text-purple-600 shadow-lg scale-105"
                          : "bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-6 h-6" />
                        <span>画像をアップロード</span>
                        <span className="text-xs opacity-80">冷蔵庫の写真から認識</span>
                      </div>
                    </Button>
                  </motion.div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {/* Enhanced Text Input Mode */}
                  {inputMode === "text" && (
                    <motion.div 
                      key="text-input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <motion.div 
                          whileFocus={{ scale: 1.02 }}
                          className="flex gap-3"
                        >
                          <div className="relative flex-1">
                            <Input
                              placeholder="食材を入力してください（例：鶏肉、玉ねぎ、人参）"
                              value={currentIngredient}
                              onChange={(e) => setCurrentIngredient(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="h-14 text-lg bg-white/20 border-white/30 text-white placeholder:text-white/70 pl-12 rounded-xl transition-all duration-300 focus:bg-white/30 focus:scale-105"
                            />
                            <Utensils className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                          </div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={addIngredient}
                              variant="secondary"
                              size="lg"
                              className="h-14 px-6 bg-white text-purple-600 hover:bg-white/90 rounded-xl font-semibold"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              追加
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {ingredients.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-white/80" />
                              <span className="text-white/80 font-medium">選択された食材 ({ingredients.length})</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              {ingredients.map((ingredient, index) => (
                                <motion.div
                                  key={ingredient}
                                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                  transition={{ delay: index * 0.1, duration: 0.3 }}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                                  >
                                    {ingredient}
                                    <motion.button 
                                      onClick={() => removeIngredient(ingredient)} 
                                      className="ml-2 hover:text-red-200 transition-colors"
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <X className="w-4 h-4" />
                                    </motion.button>
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Enhanced Image Upload Mode */}
                  {inputMode === "image" && (
                    <motion.div 
                      key="image-input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative border-2 border-dashed border-white/30 rounded-2xl p-8 text-center bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10"
                      >
                        <AnimatePresence mode="wait">
                          {imagePreview ? (
                            <motion.div 
                              key="preview"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.5 }}
                              className="space-y-6"
                            >
                              <div className="relative">
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.6 }}
                                  className="relative overflow-hidden rounded-xl"
                                >
                                  <Image
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="アップロード画像"
                                    width={500}
                                    height={300}
                                    className="max-w-full max-h-80 mx-auto rounded-xl object-cover shadow-2xl"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                                </motion.div>
                                
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.3, duration: 0.5 }}
                                  className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                >
                                  <Zap className="w-4 h-4" />
                                  AI解析準備完了
                                </motion.div>
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={() => {
                                    setUploadedImage(null)
                                    setImagePreview(null)
                                  }}
                                  variant="secondary"
                                  size="lg"
                                  className="bg-white text-purple-600 hover:bg-white/90 rounded-xl font-semibold px-8"
                                >
                                  <Camera className="w-5 h-5 mr-2" />
                                  画像を変更
                                </Button>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="upload"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.5 }}
                              className="space-y-6"
                            >
                              <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Upload className="w-16 h-16 mx-auto text-white/70" />
                              </motion.div>
                              
                              <div className="space-y-2">
                                <motion.p 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2, duration: 0.6 }}
                                  className="text-white/90 text-lg font-medium"
                                >
                                  冷蔵庫や食材の画像をアップロード
                                </motion.p>
                                <motion.p 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4, duration: 0.6 }}
                                  className="text-white/70"
                                >
                                  JPG, PNG, WebP形式に対応・最大10MB
                                </motion.p>
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                              >
                                <label htmlFor="image-upload">
                                  <Button 
                                    variant="secondary" 
                                    size="lg"
                                    className="bg-white text-purple-600 hover:bg-white/90 rounded-xl font-semibold px-8 cursor-pointer" 
                                    asChild
                                  >
                                    <span>
                                      <Upload className="w-5 h-5 mr-2" />
                                      画像を選択
                                    </span>
                                  </Button>
                                </label>
                              </motion.div>
                              
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Generate Button */}
                <AnimatePresence>
                  {((inputMode === "text" && ingredients.length > 0) || (inputMode === "image" && uploadedImage)) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleGenerateMealPlan}
                          disabled={isGenerating}
                          variant="secondary"
                          size="lg"
                          className={`w-full h-16 text-lg font-bold rounded-xl transition-all duration-300 ${
                            isGenerating 
                              ? 'bg-white/80 text-purple-600 cursor-not-allowed' 
                              : 'bg-white text-purple-600 hover:bg-white/90 hover:shadow-2xl'
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {isGenerating ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Loader2 className="w-6 h-6" />
                                </motion.div>
                                AI献立を生成中...
                              </motion.div>
                            ) : (
                              <motion.div
                                key="generate"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Sparkles className="w-6 h-6" />
                                </motion.div>
                                AI献立を生成
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Generated Meal Plan */}
        <AnimatePresence>
          {generatedMealPlan ? (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Enhanced Header Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="space-y-2">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Award className="w-8 h-8 text-green-600" />
                      </motion.div>
                      AI生成献立
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="text-muted-foreground text-lg"
                    >
                      栄養バランスを考慮した今日のおすすめ献立
                    </motion.p>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={resetInputs}
                      variant="outline"
                      size="lg"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-transparent rounded-xl font-semibold px-6"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      新しい献立を作成
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Enhanced Meal Cards Grid */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="grid gap-6 md:grid-cols-3"
              >
                {/* Basic meal cards for now - can be enhanced with the detailed design */}
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg"
                        alt={generatedMealPlan.breakfast.name}
                        width={200}
                        height={120}
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

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg"
                        alt={generatedMealPlan.lunch.name}
                        width={200}
                        height={120}
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

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg"
                        alt={generatedMealPlan.dinner.name}
                        width={200}
                        height={120}
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
              </motion.div>

              {/* Enhanced Nutrition Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
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
              </motion.div>
            </motion.div>
          ) : (
            /* Enhanced Empty State */
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              ref={featuresRef}
            >
              <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl">
                <CardContent className="space-y-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={featuresInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 blur-xl"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChefHat className="w-20 h-20 mx-auto text-orange-500 relative z-10" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {inputMode === "text"
                        ? "食材を入力してAI献立を生成しましょう"
                        : "画像をアップロードしてAI献立を生成しましょう"}
                    </h3>
                    
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      {inputMode === "text"
                        ? "冷蔵庫にある食材を入力すると、AIが栄養バランスを考慮した献立を瞬時に提案します。料理時間、カロリー、栄養素も計算して表示します。"
                        : "冷蔵庫や食材の画像をアップロードすると、AIが画像から食材を認識して最適な献立を提案します。料理時間、カロリー、栄養素も計算して表示します。"}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-4 pt-4"
                  >
                    {[
                      { icon: "🥗", text: "バランスの良い食事" },
                      { icon: "⏱️", text: "時短料理" },
                      { icon: "📊", text: "栄養管理" },
                      { icon: "🌱", text: "健康的なメニュー" }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={featuresInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full shadow-lg"
                      >
                        <span className="text-lg">{feature.icon}</span>
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">{feature.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
