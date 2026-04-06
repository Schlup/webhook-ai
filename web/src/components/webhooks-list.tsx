import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { WebhooksListItem } from './webhooks-list-item'
import { webhookListSchema } from '../http/schemas/webhook'
import { Loader2, Wand2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import { CodeBlock } from './ui/code-block'

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])

  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string | null>(null)

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

  const [isGenerating, setIsGenerating] = useState(false)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('https://webhook-ai-o425.onrender.com/api/webhooks')

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }

        const response = await fetch(url)
        const data = await response.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckWebhook(checkedWebhookId: string) {
    if (checkedWebhooksIds.includes(checkedWebhookId)) {
      setCheckedWebhooksIds(state => {
        return state.filter(webhookId => webhookId !== checkedWebhookId)
      })
    } else {
      setCheckedWebhooksIds(state => [...state, checkedWebhookId])
    }
  }

  async function handleGenerateHandler() {
    setIsGenerating(true)

    try {
      const response = await fetch('https://webhook-ai-o425.onrender.com/api/webhooks/api/generate', {
        method: 'POST',
        body: JSON.stringify({ webhooksIds: checkedWebhooksIds }),
        headers: {
          'Content-Type': 'application/json'
        },
      })

      type GenerateResponse = {
        code: string
      }

      const data: GenerateResponse = await response.json()

      setGeneratedHandlerCode(data.code)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2 ">
          <button
            disabled={!hasAnyWebhookChecked || isGenerating}
            className="bg-indigo-400 bottom-0 mb-3 text-white w-full rounded-lg flex items-center justify-center gap-3 font-medium text-sm py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
            onClick={handleGenerateHandler}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar handler'}
          </button>
          {webhooks.map(webhook => {
            return (
              <WebhooksListItem
                key={webhook.id}
                webhook={webhook}
                onWebhookChecked={handleCheckWebhook}
                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              />
            )
          })}
        </div>

        {hasNextPage && (
          <div className='p-2' ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className='flex items-center justify-center py-2'>
                <Loader2 className='size-5 text-zinc-500 animate-spin' />
              </div>
            )}
          </div>
        )}

      </div>

      {!!generatedHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex flex-col max-h-[85vh] bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl outline-none">

            <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-900 flex justify-between items-center rounded-t-xl">
              <Dialog.Title className="text-sm font-medium text-zinc-300">
                Generated Output
              </Dialog.Title>

              <Dialog.Close className="text-zinc-400 hover:text-zinc-100 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 rounded-sm">
                <X />
              </Dialog.Close>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="rounded-lg overflow-hidden border  border-zinc-800/50 bg-black/40 ring-1 ring-white/5">
                <CodeBlock language="typescript" code={generatedHandlerCode} />
              </div>
            </div>

          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}
