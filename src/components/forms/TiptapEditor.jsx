import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
    RiBold, RiItalic, RiStrikethrough, RiListUnordered, RiListOrdered, RiArrowGoBackLine, RiArrowGoForwardLine 
} from 'react-icons/ri'

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null
    }

    const buttonClass = (isActive) => `p-1.5 rounded-md transition-colors ${
        isActive ? 'bg-pink-100 text-pink-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
                title="Bold"
            >
                <RiBold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic'))}
                title="Italic"
            >
                <RiItalic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive('strike'))}
                title="Strike"
            >
                <RiStrikethrough className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <RiListUnordered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList'))}
                title="Ordered List"
            >
                <RiListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                title="Undo"
            >
                <RiArrowGoBackLine className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                title="Redo"
            >
                <RiArrowGoForwardLine className="w-4 h-4" />
            </button>
        </div>
    )
}

const TiptapEditor = ({ content, onChange, placeholder = 'Write here...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html === '<p></p>' ? '' : html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 max-w-none text-sm text-gray-800',
            },
        },
    })

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/5 transition-all w-full bg-white">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default TiptapEditor
