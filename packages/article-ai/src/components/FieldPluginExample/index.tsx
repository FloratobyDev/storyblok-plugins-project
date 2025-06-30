import './example.css'
import { FunctionComponent } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'
import ArticleAI from './ArticleAI'
import { ArticleData } from './types'
import ModalToggle from './ModalToggle'

const FieldPlugin: FunctionComponent = () => {
  const { type, data, actions } = useFieldPlugin<ArticleData>({
    enablePortalModal: true,
    validateContent: (content: unknown) => {
      if (
        typeof content === 'object' &&
        content !== null &&
        'title' in content &&
        'description' in content &&
        'loading' in content
      ) {
        return { content: content as ArticleData }
      }

      return {
        content: {
          title: '',
          description: '',
          loading: false,
        },
      }
    },
  })

  if (type !== 'loaded') return null

  console.log('data', data)
  return (
    <div>
      {data.isModalOpen && (<ModalToggle data={data} />)}
      {!data.isModalOpen && <div className="container">
        <ArticleAI data={data} actions={actions} />
      </div>}
    </div>
  )
}

export default FieldPlugin
