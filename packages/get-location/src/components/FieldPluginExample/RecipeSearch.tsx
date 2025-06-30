import { useState } from 'react'

type Recipe = {
  id: number
  title: string
  image: string
}

type RecipeSearchProps = {
  onSelect: (recipe: Recipe) => void
}

const RecipeSearch = ({ onSelect }: RecipeSearchProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Recipe[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || cooldown) return

    setIsSearching(true)
    setCooldown(true)

    try {
      const res = await fetch(
        `http://127.0.0.1:5001/spoonacular-storyblok-project/us-central1/getRecipes?query=${encodeURIComponent(query)}`
      )

      const data = await res.json()
      console.log('Date queried', data)
      setResults(data.results || [])
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
    } finally {
      setIsSearching(false)
      setTimeout(() => setCooldown(false), 2000) // 2-second cooldown
    }
  }

  return (
    <div className="recipe-search">
      <div className="search-bar">
        <input
          className="input"
          type="text"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="btn"
          onClick={handleSearch}
          disabled={cooldown || isSearching}
        >
          {isSearching ? 'Searching...' : cooldown ? 'Wait...' : 'Search'}
        </button>
      </div>

      <div className="recipe-grid">
        {results.map((recipe) => (
          <div
            key={recipe.id}
            className="recipe-card"
            onClick={() => onSelect(recipe)}
          >
            <div className="recipe-title">{recipe.title}</div>
            <img src={recipe.image} alt={recipe.title} className="recipe-img" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecipeSearch
