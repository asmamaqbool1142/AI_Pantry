'use client';

import { useEffect, useMemo, useState } from 'react';

type MealCategory = 'vegetable' | 'meat' | 'pulse';
type BudgetPeriod = 'daily' | 'weekly' | 'monthly';
type PriceStatus = 'demo' | 'estimated' | 'user-entered' | 'verified';
type NavTab = 'home' | 'meals' | 'grocery' | 'kitchen' | 'more';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry?: string;
  addedAt: string;
  status: PriceStatus;
};

type Recipe = {
  id: string;
  name: string;
  roman: string;
  category: MealCategory;
  time: string;
  spice: 'Mild' | 'Medium' | 'Spicy';
  servings: number;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
};

type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  priority: 'Must buy' | 'Important staples' | 'Fresh ingredients' | 'Guest reserve' | 'Optional';
  reason: string;
  status: PriceStatus;
};

type Household = {
  city: string;
  householdSize: number;
  guestMode: 'rarely' | '1-2 guests' | '3-5 guests' | 'choose each time';
  meals: string[];
  budget: number | null;
  budgetPeriod: BudgetPeriod;
  preferences: {
    style: string;
    spice: 'Mild' | 'Medium' | 'Spicy';
    avoid: string[];
    favorites: string[];
  };
  inventory: InventoryItem[];
  selectedMeals: string[];
  onboardComplete: boolean;
  lastUpdated: string;
};

type ChatMessage = { role: 'user' | 'assistant'; text: string };

const STORAGE_KEY = 'pantrypilot-demo-v1';

const demoRecipes: Recipe[] = [
  {
    id: 'aloo-palak',
    name: 'Aloo Palak',
    roman: 'Aloo Palak',
    category: 'vegetable',
    time: '20 min',
    spice: 'Medium',
    servings: 4,
    ingredients: [
      { name: 'spinach', quantity: 400, unit: 'g' },
      { name: 'potatoes', quantity: 400, unit: 'g' },
      { name: 'onion', quantity: 150, unit: 'g' },
      { name: 'tomato', quantity: 150, unit: 'g' },
      { name: 'garlic', quantity: 10, unit: 'g' },
      { name: 'oil', quantity: 30, unit: 'ml' },
    ],
    instructions: ['Lightly fry onion and garlic.', 'Add tomatoes and potatoes. Simmer.', 'Fold in spinach and finish with spices.'],
  },
  {
    id: 'chicken-karahi',
    name: 'Chicken Karahi',
    roman: 'Chicken Karahi',
    category: 'meat',
    time: '35 min',
    spice: 'Spicy',
    servings: 4,
    ingredients: [
      { name: 'chicken', quantity: 700, unit: 'g' },
      { name: 'tomato', quantity: 300, unit: 'g' },
      { name: 'onion', quantity: 150, unit: 'g' },
      { name: 'green chili', quantity: 15, unit: 'g' },
      { name: 'ginger', quantity: 20, unit: 'g' },
      { name: 'garlic', quantity: 15, unit: 'g' },
      { name: 'oil', quantity: 40, unit: 'ml' },
    ],
    instructions: ['Brown chicken lightly.', 'Cook onion, ginger and garlic.', 'Add tomato and finish with green chili.'],
  },
  {
    id: 'masoor-dal',
    name: 'Masoor Dal',
    roman: 'Masoor Dal',
    category: 'pulse',
    time: '30 min',
    spice: 'Mild',
    servings: 4,
    ingredients: [
      { name: 'masoor dal', quantity: 250, unit: 'g' },
      { name: 'onion', quantity: 100, unit: 'g' },
      { name: 'tomato', quantity: 150, unit: 'g' },
      { name: 'garlic', quantity: 10, unit: 'g' },
      { name: 'oil', quantity: 25, unit: 'ml' },
    ],
    instructions: ['Boil dal until soft.', 'Tempering onion, garlic and tomato.', 'Return to dal and simmer.'],
  },
  {
    id: 'bhindi-masala',
    name: 'Bhindi Masala',
    roman: 'Bhindi Masala',
    category: 'vegetable',
    time: '25 min',
    spice: 'Medium',
    servings: 4,
    ingredients: [
      { name: 'okra', quantity: 500, unit: 'g' },
      { name: 'onion', quantity: 150, unit: 'g' },
      { name: 'tomato', quantity: 200, unit: 'g' },
      { name: 'garlic', quantity: 10, unit: 'g' },
      { name: 'oil', quantity: 30, unit: 'ml' },
    ],
    instructions: ['Cook okra until just tender.', 'Add onion, tomato and spices.', 'Finish on low heat.'],
  },
  {
    id: 'keema-aloo',
    name: 'Keema Aloo',
    roman: 'Keema Aloo',
    category: 'meat',
    time: '40 min',
    spice: 'Medium',
    servings: 4,
    ingredients: [
      { name: 'mince', quantity: 500, unit: 'g' },
      { name: 'potatoes', quantity: 300, unit: 'g' },
      { name: 'onion', quantity: 200, unit: 'g' },
      { name: 'tomato', quantity: 200, unit: 'g' },
      { name: 'oil', quantity: 30, unit: 'ml' },
    ],
    instructions: ['Brown the mince.', 'Cook onion and tomato.', 'Add potatoes and simmer until soft.'],
  },
];

const starterInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'rice', quantity: 2, unit: 'kg', category: 'grain', addedAt: '2026-10-10', status: 'demo' },
  { id: 'inv-2', name: 'onion', quantity: 1.2, unit: 'kg', category: 'vegetable', addedAt: '2026-10-11', status: 'demo' },
  { id: 'inv-3', name: 'potatoes', quantity: 0.9, unit: 'kg', category: 'vegetable', addedAt: '2026-10-12', status: 'demo' },
  { id: 'inv-4', name: 'tomato', quantity: 0.7, unit: 'kg', category: 'vegetable', addedAt: '2026-10-12', status: 'demo' },
  { id: 'inv-5', name: 'oil', quantity: 1, unit: 'litre', category: 'staple', addedAt: '2026-10-09', status: 'demo' },
  { id: 'inv-6', name: 'masoor dal', quantity: 0.5, unit: 'kg', category: 'pulse', addedAt: '2026-10-08', status: 'demo' },
  { id: 'inv-7', name: 'garlic', quantity: 90, unit: 'g', category: 'vegetable', addedAt: '2026-10-10', status: 'demo' },
];

const priceMap: Record<string, { price: number; unit: string; status: PriceStatus }> = {
  potatoes: { price: 36, unit: 'kg', status: 'demo' },
  onion: { price: 80, unit: 'kg', status: 'demo' },
  tomato: { price: 110, unit: 'kg', status: 'demo' },
  spinach: { price: 150, unit: 'kg', status: 'demo' },
  okra: { price: 180, unit: 'kg', status: 'demo' },
  chicken: { price: 540, unit: 'kg', status: 'demo' },
  mince: { price: 500, unit: 'kg', status: 'demo' },
  oil: { price: 260, unit: 'litre', status: 'demo' },
  rice: { price: 160, unit: 'kg', status: 'demo' },
  'masoor dal': { price: 180, unit: 'kg', status: 'demo' },
  garlic: { price: 150, unit: 'kg', status: 'demo' },
  'green chili': { price: 120, unit: 'kg', status: 'demo' },
  ginger: { price: 220, unit: 'kg', status: 'demo' },
};

const defaultProfile: Household = {
  city: 'Lahore',
  householdSize: 4,
  guestMode: '1-2 guests',
  meals: ['lunch', 'dinner'],
  budget: 2500,
  budgetPeriod: 'weekly',
  preferences: {
    style: 'Pakistani home cooking',
    spice: 'Medium',
    avoid: ['beef'],
    favorites: ['Aloo Palak', 'Chicken Karahi'],
  },
  inventory: starterInventory,
  selectedMeals: ['aloo-palak', 'chicken-karahi', 'masoor-dal'],
  onboardComplete: true,
  lastUpdated: new Date().toISOString(),
};

const stepContent = [
  { label: 'Welcome', title: 'Assalam-o-Alaikum! Let\'s make cooking and grocery shopping easier.' },
  { label: 'Location', title: 'Which city are you in?' },
  { label: 'Household size', title: 'How many people eat at home each day?' },
  { label: 'Guests', title: 'How often do guests visit?' },
  { label: 'Meals', title: 'Which meals should we plan?' },
  { label: 'Budget', title: 'Set a grocery budget for your household.' },
  { label: 'Preferences', title: 'A few quick preferences for better suggestions.' },
  { label: 'Inventory', title: 'Do you want to add groceries now or skip and start quickly?' },
];

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString('en-PK')}`;
}

function getServingCount(profile: Household) {
  const guestMap = { rarely: 0, '1-2 guests': 2, '3-5 guests': 4, 'choose each time': 0 };
  return profile.householdSize + guestMap[profile.guestMode];
}

function getLocalDateString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function getExpiryDays(expiry: string) {
  const expiryDate = new Date(`${expiry}T00:00:00Z`).getTime();
  const today = new Date(`${getLocalDateString()}T00:00:00Z`).getTime();
  return Math.round((expiryDate - today) / 86400000);
}

function getExpiryLabel(expiry?: string) {
  if (!expiry) return '';
  const days = getExpiryDays(expiry);
  if (days < 0) return 'Past use-by date';
  if (days === 0) return 'Use today';
  if (days <= 3) return `Use within ${days} days`;
  return `Use by ${expiry}`;
}

function buildRecommendedMeals(profile: Household) {
  const preferred = profile.preferences.style.includes('Vegetarian') ? 'vegetable' : 'meat';

  const scored = demoRecipes.map((recipe) => {
    let score = 0;
    if (recipe.category === 'vegetable') score += 2;
    if (recipe.category === preferred) score += 2;
    if (profile.preferences.spice === recipe.spice) score += 1;
    if (recipe.name.includes('Aloo') || recipe.name.includes('Dal')) score += 1;
    return { ...recipe, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

function getIngredientStock(name: string, inventory: InventoryItem[]) {
  const item = inventory.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  return item ? item.quantity : 0;
}

function normalizeIngredientName(name: string) {
  return name.trim().toLowerCase();
}

function buildGroceryList(profile: Household, selected: Recipe[]) {
  const output: GroceryItem[] = [];
  const servings = getServingCount(profile);
  const inventory = profile.inventory;

  selected.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const base = ingredient.quantity * (servings / recipe.servings);
      const paidStock = getIngredientStock(ingredient.name, inventory);
      const need = Math.max(0, base - paidStock);
      if (need <= 0) return;

      const priceInfo =
        priceMap[normalizeIngredientName(ingredient.name)] ??
        { price: 120, unit: ingredient.unit, status: 'estimated' as const };
      const total = (need / (priceInfo.unit === ingredient.unit ? 1 : 1)) * priceInfo.price;

      output.push({
        id: `${recipe.id}-${ingredient.name}`,
        name: ingredient.name,
        quantity: Number(need.toFixed(2)),
        unit: ingredient.unit,
        price: priceInfo.price,
        subtotal: Number(total.toFixed(2)),
        priority:
          recipe.category === 'vegetable'
            ? 'Fresh ingredients'
            : recipe.category === 'pulse'
              ? 'Important staples'
              : 'Must buy',
        reason: `Needed for ${recipe.name}`,
        status: priceInfo.status,
      });
    });
  });

  const map = new Map<string, GroceryItem>();
  output.forEach((item) => {
    const key = `${item.name}-${item.unit}`;
    if (!map.has(key)) {
      map.set(key, item);
      return;
    }
    const existing = map.get(key)!;
    existing.quantity = Number((existing.quantity + item.quantity).toFixed(2));
    existing.subtotal = Number((existing.subtotal + item.subtotal).toFixed(2));
    existing.reason = `${existing.reason} + ${item.reason}`;
  });

  return Array.from(map.values()).sort((a, b) => b.subtotal - a.subtotal);
}

function getRecommendedAssistantReply(prompt: string, profile: Household) {
  const normalized = prompt.toLowerCase();
  const base = `Based on your ${profile.city} home and ${profile.householdSize}-person setup, I suggest a low-cost plan using what you already have.`;

  if (normalized.includes('guest') || normalized.includes('mehmaan')) {
    return `${base} Add 2 extra servings to the main dish, keep one dal and one sabzi, and use rice or potatoes to stretch the meal without overspending.`;
  }

  if (normalized.includes('budget') || normalized.includes('rashan') || normalized.includes('rs.')) {
    return `${base} Prioritize daal, seasonal sabzi, and rice. Keep chicken for one meal and make the second meal vegetarian to stay near your budget.`;
  }

  if (normalized.includes('aloo') || normalized.includes('daal') || normalized.includes('sabzi')) {
    return `${base} Try Aloo Palak or Masoor Dal, because they are affordable, easy to scale, and fit your current pantry well.`;
  }

  return `${base} A balanced plan is Aloo Palak, Chicken Karahi, and Masoor Dal. That gives you one vegetable, one protein, and one pulse while staying practical for a family home.`;
}

export default function Page() {
  const [tab, setTab] = useState<NavTab>('home');
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [profile, setProfile] = useState<Household>(defaultProfile);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState('Upload a grocery photo or receipt to simulate detection.');
  const [assistantInput, setAssistantInput] = useState('Mere paas aloo, pyaaz aur daal hai. Aaj kya banaun?');
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'PantryPilot AI here. I can suggest meals, cut waste, and help you stretch your grocery budget with what you already have.',
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unit: 'kg', category: 'vegetable', expiry: '' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setOnboardingOpen(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Household;
      setProfile(parsed);
      setOnboardingOpen(!parsed.onboardComplete);
    } catch {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const recommendedMeals = useMemo(() => buildRecommendedMeals(profile), [profile]);
  const selectedRecipes = useMemo(
    () => demoRecipes.filter((recipe) => profile.selectedMeals.includes(recipe.id)),
    [profile.selectedMeals],
  );
  const groceryList = useMemo(() => buildGroceryList(profile, selectedRecipes), [profile, selectedRecipes]);
  const groceryTotal = groceryList.reduce((sum, item) => sum + item.subtotal, 0);

  const saveHousehold = (next: Household) => {
    const normalized = { ...next, onboardComplete: true, lastUpdated: new Date().toISOString() };
    setProfile(normalized);
    setOnboardingOpen(false);
  };

  const addInventoryItem = () => {
    if (!newItem.name.trim()) return;
    setProfile((prev) => ({
      ...prev,
      inventory: [
        {
          id: `inv-${Date.now()}`,
          name: newItem.name.trim().toLowerCase(),
          quantity: Number(newItem.quantity) || 1,
          unit: newItem.unit,
          category: newItem.category,
          expiry: newItem.expiry || undefined,
          addedAt: new Date().toISOString(),
          status: 'user-entered',
        },
        ...prev.inventory,
      ],
    }));
    setNewItem({ name: '', quantity: '1', unit: 'kg', category: 'vegetable', expiry: '' });
  };

  const updateInventoryExpiry = (id: string, expiry: string) => {
    setProfile((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id ? { ...item, expiry: expiry || undefined } : item,
      ),
    }));
  };

  const updateInventoryQuantity = (id: string, delta: number) => {
    setProfile((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, Number((item.quantity + delta).toFixed(2))) }
          : item,
      ),
    }));
  };

  const toggleMeal = (mealId: string) => {
    setProfile((prev) => ({
      ...prev,
      selectedMeals: prev.selectedMeals.includes(mealId)
        ? prev.selectedMeals.filter((id) => id !== mealId)
        : [...prev.selectedMeals, mealId],
    }));
  };

  const askAssistant = async () => {
    if (!assistantInput.trim()) return;

    const prompt = assistantInput.trim();
    setAssistantMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setAssistantInput('');
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, profile }),
      });

      const result = await response.json();
      const text = result.answer || getRecommendedAssistantReply(prompt, profile);
      setAssistantMessages((prev) => [...prev, { role: 'assistant', text }]);
    } catch {
      setAssistantMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: getRecommendedAssistantReply(prompt, profile),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const shareList = async () => {
    const text = groceryList.map((item) => `${item.name}: ${item.quantity} ${item.unit} - ${formatCurrency(item.subtotal)}`).join('\n');
    if (navigator.share) {
      await navigator.share({ title: 'PantryPilot Grocery List', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    setReceiptMessage('Grocery list copied to clipboard.');
  };

  const handleUploadDemo = () => {
    setReceiptMessage('Simulated image recognition: potatoes, onion, and tomatoes detected. Please confirm quantities in My Kitchen.');
  };

  const expiryWatchlist = profile.inventory
    .filter((item) => item.expiry && getExpiryDays(item.expiry) <= 3)
    .sort((a, b) => (a.expiry ?? '').localeCompare(b.expiry ?? ''));

  const renderOnboarding = () => {
    const step = stepContent[onboardingIndex];

    const next = () => setOnboardingIndex((prev) => Math.min(prev + 1, stepContent.length - 1));
    const back = () => setOnboardingIndex((prev) => Math.max(prev - 1, 0));

    return (
      <div className="onboarding-shell">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-pantry-muted">
            <span>Setup</span>
            <span>
              {onboardingIndex + 1}/{stepContent.length}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-pantry-dark">{step.title}</h2>

          {onboardingIndex === 0 && (
            <div className="mt-6 space-y-4">
              <p className="text-base text-pantry-muted">We’ll make daily meal planning and grocery shopping easier for your home.</p>
              <button className="primary-button w-full" onClick={next}>Chaliye Shuru Karen</button>
            </div>
          )}

          {onboardingIndex === 1 && (
            <div className="mt-6 grid gap-3">
              {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'].map((city) => (
                <button
                  key={city}
                  className={`choice-button ${profile.city === city ? 'choice-button-active' : ''}`}
                  onClick={() => {
                    setProfile((prev) => ({ ...prev, city }));
                    next();
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {onboardingIndex === 2 && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <button
                  key={value}
                  className={`choice-button ${profile.householdSize === value ? 'choice-button-active' : ''}`}
                  onClick={() => {
                    setProfile((prev) => ({ ...prev, householdSize: value }));
                    next();
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {onboardingIndex === 3 && (
            <div className="mt-6 grid gap-3">
              {['rarely', '1-2 guests', '3-5 guests', 'choose each time'].map((option) => (
                <button
                  key={option}
                  className={`choice-button ${profile.guestMode === option ? 'choice-button-active' : ''}`}
                  onClick={() => {
                    setProfile((prev) => ({ ...prev, guestMode: option as Household['guestMode'] }));
                    next();
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {onboardingIndex === 4 && (
            <div className="mt-6 grid gap-3">
              {['lunch', 'dinner', 'both'].map((option) => {
                const active = profile.meals.includes(option) || (option === 'both' && profile.meals.length === 2);
                return (
                  <button
                    key={option}
                    className={`choice-button ${active ? 'choice-button-active' : ''}`}
                    onClick={() => {
                      if (option === 'both') {
                        setProfile((prev) => ({ ...prev, meals: ['lunch', 'dinner'] }));
                      } else {
                        setProfile((prev) => ({
                          ...prev,
                          meals: prev.meals.includes(option)
                            ? prev.meals.filter((meal) => meal !== option)
                            : [...prev.meals, option],
                        }));
                      }
                      next();
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {onboardingIndex === 5 && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {(['daily', 'weekly', 'monthly'] as BudgetPeriod[]).map((period) => (
                  <button
                    key={period}
                    className={`choice-button ${profile.budgetPeriod === period ? 'choice-button-active' : ''}`}
                    onClick={() => setProfile((prev) => ({ ...prev, budgetPeriod: period }))}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-pantry-dark">
                Budget in PKR
                <input
                  type="number"
                  value={profile.budget ?? 0}
                  onChange={(event) => setProfile((prev) => ({ ...prev, budget: Number(event.target.value) || 0 }))}
                  className="mt-2 w-full rounded-xl border border-pantry-green/20 bg-white px-4 py-3 text-base"
                  placeholder="2500"
                />
              </label>

              <button
                className="subtle-button"
                onClick={() => {
                  setProfile((prev) => ({ ...prev, budget: null }));
                  next();
                }}
              >
                Skip this step
              </button>
              <button className="primary-button w-full" onClick={next}>Continue</button>
            </div>
          )}

          {onboardingIndex === 6 && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {['Pakistani home cooking', 'Vegetarian meals', 'Chicken and meat', 'Daal and pulses'].map((option) => (
                  <button
                    key={option}
                    className={`choice-button ${profile.preferences.style === option ? 'choice-button-active' : ''}`}
                    onClick={() => {
                      setProfile((prev) => ({ ...prev, preferences: { ...prev.preferences, style: option } }));
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-pantry-dark">
                Ingredients or foods to avoid
                <input
                  type="text"
                  onBlur={(event) => {
                    const value = event.target.value;
                    if (!value.trim()) return;
                    setProfile((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, avoid: [...prev.preferences.avoid, value.trim()] },
                    }));
                    event.target.value = '';
                  }}
                  className="mt-2 w-full rounded-xl border border-pantry-green/20 bg-white px-4 py-3 text-base"
                  placeholder="Example: beef"
                />
              </label>

              <button className="primary-button w-full" onClick={next}>Continue</button>
            </div>
          )}

          {onboardingIndex === 7 && (
            <div className="mt-6 space-y-4 text-left">
              <button className="primary-button w-full" onClick={() => saveHousehold(profile)}>
                Save and start
              </button>
              <button
                className="subtle-button"
                onClick={() => saveHousehold({ ...profile, inventory: starterInventory, onboardComplete: true })}
              >
                Skip inventory setup
              </button>
              <button className="subtle-button" onClick={() => setOnboardingIndex(0)}>
                Start again
              </button>
            </div>
          )}

          {onboardingIndex > 0 && onboardingIndex < 7 && (
            <div className="mt-6 flex gap-3">
              <button className="subtle-button flex-1" onClick={back}>Back</button>
              <button className="primary-button flex-1" onClick={next}>Continue</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const mealCards = recommendedMeals.slice(0, 3).map((meal) => {
    const missing = meal.ingredients.map((ingredient) => {
      const stock = getIngredientStock(ingredient.name, profile.inventory);
      const required = ingredient.quantity * (getServingCount(profile) / meal.servings);
      const shortage = Math.max(0, required - stock);
      return { ...ingredient, shortage };
    });

    return (
      <div key={meal.id} className="panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">{meal.category}</p>
            <h3 className="mt-2 text-xl font-bold text-pantry-dark">{meal.name}</h3>
            <p className="text-sm text-pantry-muted">{meal.roman}</p>
          </div>
          <span className="tag">{meal.spice}</span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-pantry-muted">
          <div className="flex justify-between"><span>Time</span><strong>{meal.time}</strong></div>
          <div className="flex justify-between"><span>Servings</span><strong>{Math.max(getServingCount(profile), 1)}</strong></div>
          <div className="flex justify-between"><span>Missing</span><strong>{missing.filter((item) => item.shortage > 0).length} items</strong></div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {missing.slice(0, 3).map((ingredient) => (
            <div key={ingredient.name} className="flex justify-between text-pantry-dark">
              <span>{ingredient.name}</span>
              <span>{ingredient.shortage > 0 ? `${ingredient.shortage.toFixed(0)} ${ingredient.unit}` : 'Available'}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="primary-button flex-1" onClick={() => toggleMeal(meal.id)}>
            {profile.selectedMeals.includes(meal.id) ? 'Selected' : 'Select'}
          </button>
          <button className="subtle-button flex-1" onClick={() => toggleMeal(meal.id)}>
            Replace
          </button>
        </div>
      </div>
    );
  });

  return (
    <main className="min-h-screen bg-pantry-cream text-pantry-dark">
      {onboardingOpen && renderOnboarding()}

      {!onboardingOpen && (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
          <aside className="hidden w-72 border-r border-pantry-green/10 bg-white/60 p-5 lg:block">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-pantry-green px-3 py-2 text-sm font-semibold text-white">PantryPilot AI</div>
            </div>

            <nav className="space-y-2">
              {[
                ['home', 'Home'],
                ['meals', 'Today\'s Meals'],
                ['grocery', 'Grocery List'],
                ['kitchen', 'My Kitchen'],
                ['more', 'More'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`nav-button ${tab === key ? 'nav-button-active' : ''}`}
                  onClick={() => setTab(key as NavTab)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl bg-pantry-leaf p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Budget status</p>
              <p className="mt-3 text-2xl font-bold">{profile.budget ? formatCurrency(profile.budget - groceryTotal) : 'Flexible'}</p>
              <p className="mt-1 text-sm text-pantry-muted">Remaining after planned purchases</p>
            </div>
          </aside>

          <div className="flex-1 pb-24 lg:pb-8">
            <header className="sticky top-0 z-20 border-b border-pantry-green/10 bg-pantry-cream/90 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">PantryPilot</p>
                  <h1 className="text-xl font-bold text-pantry-dark">Good evening, family</h1>
                </div>
                <button className="subtle-button" onClick={() => setOnboardingOpen(true)}>
                  Edit setup
                </button>
              </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-5">
              {tab === 'home' && (
                <section className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="panel p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Household</p>
                          <h2 className="mt-2 text-2xl font-bold text-pantry-dark">{profile.householdSize} people in {profile.city}</h2>
                        </div>
                        <div className="rounded-2xl bg-pantry-green px-4 py-3 text-right text-white shadow-soft">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Budget left</p>
                          <p className="text-lg font-bold">{profile.budget ? formatCurrency(profile.budget - groceryTotal) : 'Flexible'}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-base text-pantry-muted">
                        We checked your kitchen list. Here is what you can cook and what you still need.
                      </p>
                    </div>

                    <div className="panel p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">This week</p>
                      <div className="mt-3 space-y-3 text-sm">
                        <div className="flex justify-between"><span>Guests</span><strong>{profile.guestMode}</strong></div>
                        <div className="flex justify-between"><span>Meals</span><strong>{profile.meals.join(', ')}</strong></div>
                        <div className="flex justify-between"><span>Price status</span><strong>Demo pricing</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <button className="primary-button" onClick={() => setTab('meals')}>Make My Grocery List</button>
                    <button className="subtle-button" onClick={() => setTab('kitchen')}>Check My Kitchen</button>
                    <div className="panel p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Prices last updated</p>
                      <p className="mt-2 text-lg font-bold text-pantry-dark">Today, demo mode</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">{mealCards}</div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="panel p-4">
                      <h3 className="text-lg font-bold text-pantry-dark">Important items running low</h3>
                      <ul className="mt-3 space-y-2 text-sm text-pantry-muted">
                        <li>• Spinach is low and seasonal for Lahore</li>
                        <li>• Potatoes are below your planned need for tonight</li>
                        <li>• Masoor dal is low and useful for a budget-friendly meal</li>
                      </ul>
                    </div>

                    <div className="panel p-4">
                      <h3 className="text-lg font-bold text-pantry-dark">Use soon</h3>
                      <ul className="mt-3 space-y-2 text-sm text-pantry-muted">
                        {expiryWatchlist.length > 0 ? (
                          expiryWatchlist.slice(0, 3).map((item) => (
                            <li key={item.id}>
                              {item.name} · {item.quantity} {item.unit} · {getExpiryLabel(item.expiry)}
                            </li>
                          ))
                        ) : (
                          <li>No items have a use-by date in the next 3 days. Add dates in My Kitchen.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {tab === 'meals' && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-pantry-dark">Daily meal recommendations</h2>
                    <span className="tag">{recommendedMeals.length} options</span>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">{mealCards}</div>
                </section>
              )}

              {tab === 'grocery' && (
                <section className="space-y-5">
                  <div className="panel p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-pantry-dark">Smart grocery planner</h2>
                      <button className="subtle-button" onClick={shareList}>Share list</button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-pantry-green/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Estimated total</p>
                        <p className="mt-2 text-xl font-bold">{formatCurrency(groceryTotal)}</p>
                      </div>
                      <div className="rounded-2xl bg-pantry-green/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Budget remaining</p>
                        <p className="mt-2 text-xl font-bold">{profile.budget ? formatCurrency(profile.budget - groceryTotal) : 'Flexible'}</p>
                      </div>
                      <div className="rounded-2xl bg-pantry-green/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-pantry-muted">Status</p>
                        <p className="mt-2 text-xl font-bold">
                          {profile.budget && groceryTotal > profile.budget ? 'Over budget' : 'Within plan'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {groceryList.map((item) => (
                      <div key={item.id} className="panel p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" className="mt-1 h-5 w-5 accent-pantry-green" />
                            <div>
                              <h3 className="font-bold text-pantry-dark">{item.name}</h3>
                              <p className="text-sm text-pantry-muted">{item.priority} · {item.reason}</p>
                            </div>
                          </div>
                          <span className="tag">{item.status}</span>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-pantry-muted sm:grid-cols-3">
                          <div><span>Qty</span><strong className="block text-pantry-dark">{item.quantity} {item.unit}</strong></div>
                          <div><span>Unit price</span><strong className="block text-pantry-dark">{formatCurrency(item.price)}</strong></div>
                          <div><span>Subtotal</span><strong className="block text-pantry-dark">{formatCurrency(item.subtotal)}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === 'kitchen' && (
                <section className="space-y-5">
                  <div className="panel p-4">
                    <h2 className="text-2xl font-bold text-pantry-dark">My Kitchen</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-5">
                      <input
                        value={newItem.name}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Ingredient"
                        className="rounded-xl border border-pantry-green/20 bg-white px-3 py-3 text-base"
                      />
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, quantity: event.target.value }))}
                        className="rounded-xl border border-pantry-green/20 bg-white px-3 py-3 text-base"
                      />
                      <select
                        value={newItem.unit}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, unit: event.target.value }))}
                        className="rounded-xl border border-pantry-green/20 bg-white px-3 py-3 text-base"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="litre">litre</option>
                        <option value="ml">ml</option>
                        <option value="pieces">pieces</option>
                        <option value="packet">packet</option>
                      </select>
                      <label className="text-sm font-medium text-pantry-dark">
                        Use by (optional)
                        <input
                          type="date"
                          value={newItem.expiry}
                          onChange={(event) => setNewItem((prev) => ({ ...prev, expiry: event.target.value }))}
                          className="mt-1 w-full rounded-xl border border-pantry-green/20 bg-white px-3 py-3 text-base"
                        />
                      </label>
                      <button className="primary-button" onClick={addInventoryItem}>Add item</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {profile.inventory.map((item) => (
                      <div key={item.id} className="panel p-4">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-pantry-dark">{item.name}</h3>
                            <p className="text-sm text-pantry-muted">{item.category}</p>
                            {item.expiry && (
                              <p className="mt-1 text-sm text-pantry-muted">{getExpiryLabel(item.expiry)}</p>
                            )}
                          </div>
                          <label className="min-w-44 text-sm font-medium text-pantry-dark">
                            Use by
                            <input
                              type="date"
                              value={item.expiry ?? ''}
                              onChange={(event) => updateInventoryExpiry(item.id, event.target.value)}
                              className="mt-1 w-full rounded-xl border border-pantry-green/20 bg-white px-3 py-2 text-base"
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <button className="subtle-button px-3 py-2" onClick={() => updateInventoryQuantity(item.id, -0.25)}>-</button>
                            <span className="min-w-16 text-center text-base font-bold">{item.quantity} {item.unit}</span>
                            <button className="subtle-button px-3 py-2" onClick={() => updateInventoryQuantity(item.id, 0.25)}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="panel p-4">
                    <h3 className="text-lg font-bold text-pantry-dark">Receipt or photo workflow</h3>
                    <p className="mt-2 text-sm text-pantry-muted">{receiptMessage}</p>
                    <div className="mt-4 flex gap-3">
                      <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleUploadDemo} />
                      <label htmlFor="image-upload" className="primary-button cursor-pointer">Upload image</label>
                      <button className="subtle-button" onClick={handleUploadDemo}>Demo recognition</button>
                    </div>
                  </div>
                </section>
              )}

              {tab === 'more' && (
                <section className="space-y-5">
                  <div className="panel p-4">
                    <h2 className="text-2xl font-bold text-pantry-dark">PantryPilot AI Coach</h2>
                    <div className="mt-4 space-y-3">
                      {assistantMessages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={`rounded-2xl p-3 text-sm ${
                            message.role === 'assistant'
                              ? 'bg-pantry-green/5 text-pantry-dark'
                              : 'bg-pantry-cream text-pantry-dark'
                          }`}
                        >
                          {message.text}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <textarea
                        value={assistantInput}
                        onChange={(event) => setAssistantInput(event.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-pantry-green/20 bg-white p-3 text-base"
                        placeholder="Mere paas aloo, pyaaz aur daal hai. Aaj kya banaun?"
                      />
                    </div>

                    <div className="mt-3 flex gap-3">
                      <button className="primary-button" onClick={askAssistant} disabled={isAiThinking}>
                        {isAiThinking ? 'Thinking...' : 'Ask PantryPilot'}
                      </button>
                      <button
                        className="subtle-button"
                        onClick={() => setAssistantMessages([{ role: 'assistant', text: 'AI coach ready. Ask for recipes, guest plan, or a budget-friendly menu.' }])}
                      >
                        Reset chat
                      </button>
                    </div>
                  </div>

                  <div className="panel p-4">
                    <h2 className="text-2xl font-bold text-pantry-dark">Household preferences</h2>
                    <ul className="mt-3 space-y-2 text-sm text-pantry-muted">
                      <li>• Preferred style: {profile.preferences.style}</li>
                      <li>• Spice level: {profile.preferences.spice}</li>
                      <li>• Avoid: {profile.preferences.avoid.join(', ') || 'None listed'}</li>
                      <li>• Budget: {profile.budget ? formatCurrency(profile.budget) : 'Not set'}</li>
                    </ul>
                  </div>

                  <div className="panel p-4">
                    <h3 className="text-lg font-bold text-pantry-dark">Reset demo data</h3>
                    <button
                      className="primary-button mt-3"
                      onClick={() => {
                        setProfile(defaultProfile);
                        setOnboardingOpen(true);
                      }}
                    >
                      Reset pantry
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {!onboardingOpen && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-pantry-green/10 bg-white/95 p-3 shadow-soft lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-5 gap-2">
            {[
              ['home', 'Home'],
              ['meals', 'Meals'],
              ['grocery', 'List'],
              ['kitchen', 'Kitchen'],
              ['more', 'More'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`nav-pill ${tab === key ? 'nav-pill-active' : ''}`}
                onClick={() => setTab(key as NavTab)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </main>
  );
}
