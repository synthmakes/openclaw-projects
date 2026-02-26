'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recipes, getRecipesByCategory } from '../lib/recipes';
import { calculateNutrition, activityLevels, goals } from '../lib/calculator';

export default function Home() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  const [nutrition, setNutrition] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [showRecipe, setShowRecipe] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const calculateResults = () => {
    const result = calculateNutrition(profile);
    setNutrition(result);
    setStep(2);
  };

  const addMealToDay = (recipe) => {
    if (!selectedMeals.find(m => m.id === recipe.id)) {
      setSelectedMeals(prev => [...prev, recipe]);
    }
  };

  const removeMeal = (recipeId) => {
    setSelectedMeals(prev => prev.filter(m => m.id !== recipeId));
  };

  const generateShoppingList = () => {
    const allIngredients = selectedMeals.flatMap(meal => meal.ingredients);
    const consolidated = {};
    
    allIngredients.forEach(ing => {
      const normalized = ing.toLowerCase().trim();
      if (consolidated[normalized]) {
        consolidated[normalized].count += 1;
      } else {
        consolidated[normalized] = { name: ing, count: 1 };
      }
    });
    
    setShoppingList(Object.values(consolidated));
    setStep(4);
  };

  const totalNutrition = selectedMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-luxury-black/80 backdrop-blur-md border-b border-luxury-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-goldDark flex items-center justify-center">
              <span className="text-xl">🍳</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">INDIAN PROTEIN</h1>
              <p className="text-xs text-luxury-subtle tracking-widest">KITCHEN</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setStep(1)}
              className={`text-sm transition-colors ${step === 1 ? 'text-luxury-gold' : 'text-luxury-subtle hover:text-white'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => nutrition && setStep(2)}
              className={`text-sm transition-colors ${step === 2 ? 'text-luxury-gold' : 'text-luxury-subtle hover:text-white'}`}
            >
              Meals
            </button>
            <button 
              onClick={() => selectedMeals.length > 0 && setStep(3)}
              className={`text-sm transition-colors ${step === 3 ? 'text-luxury-gold' : 'text-luxury-subtle hover:text-white'}`}
            >
              Day Plan
            </button>
            <button 
              onClick={() => shoppingList.length > 0 && setStep(4)}
              className={`text-sm transition-colors ${step === 4 ? 'text-luxury-gold' : 'text-luxury-subtle hover:text-white'}`}
            >
              Shop
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: Profile Setup */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-light mb-4">
                    Your <span className="gold-gradient font-semibold">Fitness Journey</span> Starts Here
                  </h2>
                  <p className="text-luxury-subtle">Tell us about yourself to personalize your meal plan</p>
                </div>

                <div className="bg-luxury-card rounded-2xl p-8 border border-luxury-border">
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm text-luxury-subtle mb-2">Your Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 rounded-xl bg-luxury-dark border border-luxury-border focus:border-luxury-gold transition-colors"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm text-luxury-subtle mb-2">Gender</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleProfileChange('gender', 'male')}
                          className={`py-3 px-4 rounded-xl border transition-all ${
                            profile.gender === 'male' 
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' 
                              : 'border-luxury-border text-luxury-subtle hover:border-luxury-muted'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          onClick={() => handleProfileChange('gender', 'female')}
                          className={`py-3 px-4 rounded-xl border transition-all ${
                            profile.gender === 'female' 
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' 
                              : 'border-luxury-border text-luxury-subtle hover:border-luxury-muted'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    {/* Weight & Age */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-luxury-subtle mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={profile.weight}
                          onChange={(e) => handleProfileChange('weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 rounded-xl bg-luxury-dark border border-luxury-border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-luxury-subtle mb-2">Age</label>
                        <input
                          type="number"
                          value={profile.age}
                          onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 rounded-xl bg-luxury-dark border border-luxury-border"
                        />
                      </div>
                    </div>

                    {/* Height */}
                    <div>
                      <label className="block text-sm text-luxury-subtle mb-2">Height (cm)</label>
                      <input
                        type="range"
                        min="140"
                        max="220"
                        value={profile.height}
                        onChange={(e) => handleProfileChange('height', parseInt(e.target.value))}
                        className="w-full accent-luxury-gold"
                      />
                      <div className="flex justify-between text-xs text-luxury-muted mt-1">
                        <span>140 cm</span>
                        <span className="text-luxury-gold font-medium">{profile.height} cm</span>
                        <span>220 cm</span>
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div>
                      <label className="block text-sm text-luxury-subtle mb-2">Activity Level</label>
                      <select
                        value={profile.activityLevel}
                        onChange={(e) => handleProfileChange('activityLevel', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-luxury-dark border border-luxury-border"
                      >
                        {Object.entries(activityLevels).map(([key, { label, description }]) => (
                          <option key={key} value={key} className="bg-luxury-dark">
                            {label} - {description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Goal */}
                    <div>
                      <label className="block text-sm text-luxury-subtle mb-2">Your Goal</label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(goals).map(([key, { label, description }]) => (
                          <button
                            key={key}
                            onClick={() => handleProfileChange('goal', key)}
                            className={`py-3 px-3 rounded-xl border text-left transition-all ${
                              profile.goal === key 
                                ? 'border-luxury-gold bg-luxury-gold/10' 
                                : 'border-luxury-border hover:border-luxury-muted'
                            }`}
                          >
                            <span className={`block text-sm font-medium ${profile.goal === key ? 'text-luxury-gold' : 'text-white'}`}>
                              {label}
                            </span>
                            <span className="block text-xs text-luxury-muted mt-1">{description}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                      onClick={calculateResults}
                      className="w-full py-4 mt-8 bg-gradient-to-r from-luxury-goldDark to-luxury-gold text-luxury-black font-semibold rounded-xl btn-luxury hover:opacity-90 transition-opacity"
                    >
                      Calculate My Nutrition Plan
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Meal Selection */}
            {step === 2 && nutrition && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Nutrition Summary */}
                <div className="bg-luxury-card rounded-2xl p-6 border border-luxury-border mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <p className="text-luxury-subtle text-sm mb-1">Your Daily Target</p>
                      <p className="text-4xl font-light">{nutrition.dailyCalories} <span className="text-luxury-subtle text-lg">kcal</span></p>
                      <p className="text-luxury-gold text-sm mt-1 capitalize">{profile.goal === 'maintain' ? 'Maintenance' : profile.goal === 'cut' ? 'Cutting' : 'Bulking'} Mode</p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-luxury-gold">{nutrition.macros.protein}g</p>
                        <p className="text-xs text-luxury-subtle">Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{nutrition.macros.carbs}g</p>
                        <p className="text-xs text-luxury-subtle">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{nutrition.macros.fat}g</p>
                        <p className="text-xs text-luxury-subtle">Fat</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Categories */}
                {['breakfast', 'lunch', 'dinner', 'snacks'].map(category => (
                  <div key={category} className="mb-10">
                    <h3 className="text-xl font-medium mb-4 capitalize flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-luxury-gold"></span>
                      {category}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getRecipesByCategory(category).map(recipe => (
                        <div
                          key={recipe.id}
                          className="bg-luxury-card rounded-xl border border-luxury-border overflow-hidden card-hover cursor-pointer"
                          onClick={() => setShowRecipe(recipe)}
                        >
                          <div className="h-40 bg-luxury-dark relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-luxury-card to-transparent"></div>
                            <div className="absolute top-3 right-3 bg-luxury-gold/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-luxury-gold">
                              {recipe.category}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium mb-2">{recipe.name}</h4>
                            <div className="flex justify-between text-sm text-luxury-subtle">
                              <span>{recipe.prepTime}</span>
                              <span className="text-luxury-gold">{recipe.protein}g protein</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {selectedMeals.length > 0 && (
                  <div className="fixed bottom-6 left-0 right-0 px-6">
                    <div className="max-w-6xl mx-auto bg-luxury-card rounded-2xl p-4 border border-luxury-gold flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedMeals.length} meals selected</p>
                        <p className="text-sm text-luxury-subtle">
                          {totalNutrition.calories} kcal | {totalNutrition.protein}g protein
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(3)}
                          className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium rounded-xl"
                        >
                          View Day Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Day Plan */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-light mb-2">
                    Your <span className="gold-gradient font-semibold">Day Plan</span>
                  </h2>
                  <p className="text-luxury-subtle">
                    Target: {nutrition.dailyCalories} kcal | You have: {totalNutrition.calories} kcal
                  </p>
                </div>

                {selectedMeals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-luxury-subtle mb-4">No meals selected yet</p>
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2 border border-luxury-gold text-luxury-gold rounded-xl hover:bg-luxury-gold/10"
                    >
                      Browse Recipes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedMeals.map(meal => (
                      <div
                        key={meal.id}
                        className="bg-luxury-card rounded-xl border border-luxury-border p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{meal.name}</h4>
                          <div className="flex gap-4 mt-1 text-sm text-luxury-subtle">
                            <span>{meal.calories} kcal</span>
                            <span className="text-luxury-gold">{meal.protein}g protein</span>
                            <span>{meal.carbs}g carbs</span>
                            <span>{meal.fat}g fat</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowRecipe(meal)}
                            className="px-4 py-2 text-sm border border-luxury-border rounded-lg hover:border-luxury-gold transition-colors"
                          >
                            View Recipe
                          </button>
                          <button
                            onClick={() => removeMeal(meal.id)}
                            className="px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-luxury-border rounded-xl hover:border-luxury-gold transition-colors"
                  >
                    Add More Meals
                  </button>
                  <button
                    onClick={generateShoppingList}
                    disabled={selectedMeals.length === 0}
                    className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium rounded-xl disabled:opacity-50"
                  >
                    Generate Shopping List
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Shopping List */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-light mb-2">
                    <span className="gold-gradient font-semibold">Shopping</span> List
                  </h2>
                  <p className="text-luxury-subtle">
                    {shoppingList.length} ingredients for your selected meals
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-luxury-card rounded-2xl border border-luxury-border overflow-hidden">
                    {shoppingList.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 flex items-center gap-3 ${
                          index !== shoppingList.length - 1 ? 'border-b border-luxury-border' : ''
                        }`}
                      >
                        <div className="w-5 h-5 rounded border border-luxury-border flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-luxury-gold/30"></div>
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {item.count > 1 && (
                          <span className="text-xs text-luxury-muted">×{item.count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 border border-luxury-border rounded-xl hover:border-luxury-gold transition-colors"
                  >
                    Back to Meals
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSelectedMeals([]);
                      setShoppingList([]);
                    }}
                    className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium rounded-xl"
                  >
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Recipe Modal */}
      <AnimatePresence>
        {showRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-luxury-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-luxury-card rounded-2xl border border-luxury-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-medium">{showRecipe.name}</h3>
                    <p className="text-luxury-subtle">{showRecipe.category} • {showRecipe.prepTime} prep • {showRecipe.cookTime} cook</p>
                  </div>
                  <button
                    onClick={() => setShowRecipe(null)}
                    className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center hover:border-luxury-gold transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-luxury-dark rounded-xl p-3 text-center">
                    <p className="text-lg font-semibold text-luxury-gold">{showRecipe.calories}</p>
                    <p className="text-xs text-luxury-subtle">Calories</p>
                  </div>
                  <div className="bg-luxury-dark rounded-xl p-3 text-center">
                    <p className="text-lg font-semibold text-luxury-gold">{showRecipe.protein}g</p>
                    <p className="text-xs text-luxury-subtle">Protein</p>
                  </div>
                  <div className="bg-luxury-dark rounded-xl p-3 text-center">
                    <p className="text-lg font-semibold">{showRecipe.carbs}g</p>
                    <p className="text-xs text-luxury-subtle">Carbs</p>
                  </div>
                  <div className="bg-luxury-dark rounded-xl p-3 text-center">
                    <p className="text-lg font-semibold">{showRecipe.fat}g</p>
                    <p className="text-xs text-luxury-subtle">Fat</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-luxury-subtle mb-3 uppercase tracking-wider">Ingredients</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {showRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold"></span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-luxury-subtle mb-3 uppercase tracking-wider">Instructions</h4>
                  <ol className="space-y-3">
                    {showRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-luxury-gold/20 text-luxury-gold text-sm flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-luxury-light">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={() => {
                    addMealToDay(showRecipe);
                    setShowRecipe(null);
                  }}
                  disabled={selectedMeals.find(m => m.id === showRecipe.id)}
                  className="w-full mt-6 py-3 bg-luxury-gold text-luxury-black font-medium rounded-xl disabled:opacity-50"
                >
                  {selectedMeals.find(m => m.id === showRecipe.id) ? 'Already Added' : 'Add to My Day'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
