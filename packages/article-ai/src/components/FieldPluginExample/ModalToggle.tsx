import { FunctionComponent, useState } from 'react'
import type { FieldPluginData } from '@storyblok/field-plugin'
import { ArticleData } from './types'

type Props = {
  data: FieldPluginData<ArticleData>
}

const ModalToggle: FunctionComponent<Props> = ({ data }) => {
  const [articleData, setArticleData] = useState({
    title: data.content.title ?? '',
    description: data.content.description ?? '',
  })

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!data.content.loading && (
          <div className="input-group">
            <div className="form-control">
              <label htmlFor="article-title" className="input-label">Article Title</label>
              <input
                id="article-title"
                className="address-input"
                type="text"
                placeholder="Enter an address..."
                value={articleData.title}
                onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label htmlFor="article-description" className="input-label">Article Content</label>
              <textarea
                id="article-description"
                className="address-textarea"
                placeholder="Enter your article content..."
                value={articleData.description}
                onChange={(e) => setArticleData({ ...articleData, description: e.target.value })}
              />
            </div>
          </div>
        )}
        {data.content.loading && <p className="article-loading">Generating article...</p>}
      </div>
    </div>
  )
}

export default ModalToggle
