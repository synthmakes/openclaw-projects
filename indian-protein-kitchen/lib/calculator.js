// Calorie and Macro Calculator
// Uses Mifflin-St Jeor Equation for BMR calculation

// Activity Level Multipliers
export const activityLevels = {
  sedentary: {
    value: 1.2,
    label: "Sedentary",
    description: "Little or no exercise, desk job"
  },
  light: {
    value: 1.375,
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week"
  },
  moderate: {
    value: 1.55,
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week"
  },
  active: {
    value: 1.725,
    label: "Very Active",
    description: "Hard exercise 6-7 days/week"
  },
  athlete: {
    value: 1.9,
    label: "Athlete",
    description: "2x per day training, physical job"
  }
};

// Goals
export const goals = {
  cut: {
    label: "Cut",
    description: "Lose fat while preserving muscle",
    calorieAdjustment: -500, // 500 calorie deficit
    proteinMultiplier: 1.1, // Higher protein to preserve muscle
    carbRatio: 0.30,
    proteinRatio: 0.40,
    fatRatio: 0.30
  },
  maintain: {
    label: "Maintain",
    description: "Maintain current weight",
    calorieAdjustment: 0,
    proteinMultiplier: 1.0,
    carbRatio: 0.40,
    proteinRatio: 0.30,
    fatRatio: 0.30
  },
  bulk: {
    label: "Bulk",
    description: "Build muscle",
    calorieAdjustment: 300, // 300 calorie surplus
    proteinMultiplier: 1.0,
    carbRatio: 0.45,
    proteinRatio: 0.30,
    fatRatio: 0.25
  }
};

// Calculate BMR using Mifflin-St Jeor Equation
export const calculateBMR = (weight, height, age, gender) => {
  // Weight in kg, height in cm, age in years
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
  
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (bmr, activityLevel) => {
  return Math.round(bmr * activityLevels[activityLevel].value);
};

// Calculate daily calories based on goal
export const calculateDailyCalories = (tdee, goal) => {
  return Math.round(tdee + goals[goal].calorieAdjustment);
};

// Calculate macros in grams
export const calculateMacros = (dailyCalories, goal) => {
  const goalData = goals[goal];
  
  const protein = Math.round((dailyCalories * goalData.proteinRatio) / 4); // 4 cal per gram protein
  const carbs = Math.round((dailyCalories * goalData.carbRatio) / 4); // 4 cal per gram carbs
  const fat = Math.round((dailyCalories * goalData.fatRatio) / 9); // 9 cal per gram fat
  
  return {
    protein,
    carbs,
    fat,
    total: protein + carbs + fat
  };
};

// Calculate meal distribution
export const calculateMealDistribution = (dailyCalories, mealCount = 3) => {
  const meals = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10
  };
  
  // Adjust based on meal count
  const distribution = {};
  const mealKeys = Object.keys(meals).slice(0, mealCount);
  const remainingMeals = Object.keys(meals).slice(mealCount);
  
  let distributed = 0;
  mealKeys.forEach((meal, index) => {
    if (index === mealKeys.length - 1) {
      distribution[meal] = Math.round(dailyCalories * (1 - distributed));
    } else {
      const cal = Math.round(dailyCalories * (meals[meal] / (mealKeys.length * 0.55)));
      distribution[meal] = cal;
      distributed += cal / dailyCalories;
    }
  });
  
  remainingMeals.forEach(meal => {
    distribution[meal] = 0;
  });
  
  return distribution;
};

// Main calculator function
export const calculateNutrition = (profile) => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = calculateDailyCalories(tdee, goal);
  const macros = calculateMacros(dailyCalories, goal);
  const mealDistribution = calculateMealDistribution(dailyCalories);
  
  return {
    bmr,
    tdee,
    dailyCalories,
    macros,
    mealDistribution,
    goal: goals[goal]
  };
};

// Convert units
export const convertWeight = (value, from, to) => {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lbs') {
    return Math.round(value * 2.20462);
  }
  if (from === 'lbs' && to === 'kg') {
    return Math.round(value / 2.20462);
  }
  
  return value;
};

export const convertHeight = (value, from, to) => {
  if (from === to) return value;
  
  // Assuming value is in cm if number, or handle feet/inches
  if (from === 'cm' && to === 'feet') {
    return Math.round(value / 30.48 * 10) / 10;
  }
  
  return value;
};
