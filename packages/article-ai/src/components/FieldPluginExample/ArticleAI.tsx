import { FieldPluginActions, FieldPluginData } from '@storyblok/field-plugin'
import { FunctionComponent, useState } from 'react'
import { ArticleData } from './types'

type Props = {
  data: FieldPluginData<ArticleData>;
  actions: FieldPluginActions<ArticleData>;
}

const ArticleAI: FunctionComponent<Props> = ({ data, actions }) => {
  const [query, setQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // const handleGenerate = async () => {
  //   if (!query.trim()) return

  //   actions.setModalOpen(true)
  //   setIsGenerating(true)

  //   try {
  //     // Simulate async article generation
  //     const res = await fetch(
  //       `https://your-ai-service.com/generate-article?topic=${encodeURIComponent(query)}`
  //     )
  //     const article = await res.json()

  //     if (!article.title || !article.description) {
  //       throw new Error('Invalid article format')
  //     }

  //     actions.setContent({
  //       title: article.title,
  //       description: article.description,
  //       loading: false,
  //     })
  //   } catch (err) {
  //     console.error('Article generation failed:', err)
  //     actions.setContent({
  //       title: 'Error',
  //       description: 'Failed to generate article.',
  //       loading: false,
  //     })
  //   } finally {
  //     setIsGenerating(false)
  //   }
  // }

  const handleGenerate = async () => {
    if (!query.trim()) return
    setIsGenerating(true)
    try {
      // Mock article generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulated AI-generated article content
      const article = {
        title: `The Future of ${query}`,
        description: `In this article, we explore how ${query} is shaping industries, influencing behavior, and driving innovation. From practical use cases to long-term implications, readers will gain a comprehensive understanding of why ${query} matters today and in the future.`
      }

      actions.setContent({
        title: article.title,
        description: article.description,
        loading: false,
      })
      console.log("Content has been set.")
    } catch (err) {
      console.error('Mock article generation failed:', err)
      actions.setContent({
        title: 'Error',
        description: 'Failed to generate article.',
        loading: false,
      })
    } finally {
      setIsGenerating(false)
      actions.setModalOpen(true)
    }
  }


  return (
    <div className="input-group">
      <input
        className="address-input"
        type="text"
        placeholder="Enter an article topic..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="address-button"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Article'}
      </button>
    </div>
  )
}

export default ArticleAI
