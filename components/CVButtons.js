'use client'

import { Download, Printer } from 'lucide-react'
import siteConfig from '../site.config'

export default function CVButtons() {
  const cvFiles = siteConfig.cvFiles || {}

  const showDownloadBtn = siteConfig.cvConfig?.showDownloadButton !== false
  const showPrintBtn = siteConfig.cvConfig?.showPrintButton !== false

  const handlePrint = () => window.print()

  // ✅ basePath for your current deployment
  const basePath = '/portfolio'

  const toCvAsset = (filename) => `${basePath}/cv/${filename}`

  return (
    <div className="flex gap-3 flex-wrap print:hidden">
      {showDownloadBtn && cvFiles.en && (
        <a
          href={toCvAsset(cvFiles.en)}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-200 transition-colors text-sm font-medium shadow-sm"
        >
          <Download className="h-4 w-4" />
          Download (EN)
        </a>
      )}

      {showDownloadBtn && cvFiles.fr && (
        <a
          href={toCvAsset(cvFiles.fr)}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-200 transition-colors text-sm font-medium shadow-sm"
        >
          <Download className="h-4 w-4" />
          Télécharger (FR)
        </a>
      )}

      {showPrintBtn && (
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      )}
    </div>
  )
}