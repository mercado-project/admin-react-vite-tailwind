type ModalProps = {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <h3 className="font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
