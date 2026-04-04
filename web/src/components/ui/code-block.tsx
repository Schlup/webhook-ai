import { useEffect, useState, type ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
import { codeToHtml } from 'shiki'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps extends ComponentProps<'div'> {
    code: string
    language?: string
}

export function CodeBlock({
    className,
    code,
    language = 'json',
    ...props
}: CodeBlockProps) {
    const [parsedCode, setParsedCode] = useState('')
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (code) {
            codeToHtml(code, { lang: language, theme: 'andromeeda' }).then(
                (parsed) => setParsedCode(parsed),
            )
        }
    }, [code, language])

    const handleCopy = async () => {
        if (!code) return

        await navigator.clipboard.writeText(code)
        setIsCopied(true)

        setTimeout(() => {
            setIsCopied(false)
        }, 2000)
    }

    return (
        <div
            className={twMerge(
                'relative rounded-lg border border-zinc-700 overflow-hidden group',
                className,
            )}
            {...props}
        >
            <button
                onClick={handleCopy}
                className="absolute right-3 cursor-pointer top-3 z-10 p-1.5 rounded-md bg-zinc-800/80 text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-700 hover:text-zinc-100"
            >
                {isCopied ? (
                    <Check className="size-4 text-green-400" />
                ) : (
                    <Copy className="size-4" />
                )}
            </button>

            <div
                className='[&_pre]:p-4 [&_pre]:pr-12 [&_pre]:text-sm [&_pre]:font-mono [&_pre]:leading-tight [&_pre]:overflow-x-auto'
                dangerouslySetInnerHTML={{ __html: parsedCode }}
            />
        </div>
    )
}