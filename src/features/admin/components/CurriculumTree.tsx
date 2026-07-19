'use client'

import { useState } from 'react'
import { CurriculumNode } from '../types/admin'
import { ChevronDown, ChevronRight, Folder, FolderOpen, BookOpen, Layers, Edit2, Trash2 } from 'lucide-react'

interface CurriculumTreeProps {
  initialTree: CurriculumNode[]
}

export function CurriculumTree({ initialTree }: CurriculumTreeProps) {
  const [tree] = useState<CurriculumNode[]>(initialTree)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleExpand = (nodeId: string) => {
    const next = new Set(expandedNodes)
    if (next.has(nodeId)) {
      next.delete(nodeId)
    } else {
      next.add(nodeId)
    }
    setExpandedNodes(next)
  }

  const renderNode = (node: CurriculumNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    // Icons map
    const getIcon = () => {
      if (node.type === 'domain') return isExpanded ? FolderOpen : Folder
      if (node.type === 'path') return Layers
      if (node.type === 'module') return Folder
      return BookOpen
    }
    const Icon = getIcon()

    return (
      <div key={node.id} className="space-y-1">
        {/* Node container row */}
        <div
          style={{ paddingRight: `${depth * 24}px` }}
          className={`flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group`}
        >
          <div className="flex items-center gap-3">
            {/* Expand / Collapse Indicator */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-6 h-6"></span>
            )}

            {/* Entity Icon */}
            <Icon className={`w-4 h-4 ${node.type === 'domain' ? 'text-teal-600' : 'text-slate-400'}`} />

            {/* Node Title */}
            <span className="text-sm font-medium text-slate-700">{node.title}</span>

            {/* Tag metadata badge */}
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase font-semibold">
              {node.type === 'domain' ? 'نطاق' : node.type === 'path' ? 'مسار' : node.type === 'module' ? 'وحدة' : 'درس'}
            </span>
          </div>

          {/* Edit placeholder controls */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Children rendering */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 border-r border-slate-100 mr-4">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {tree.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">لا يوجد عناصر لعرضها في الهيكل الحالي.</p>
      ) : (
        <div className="space-y-1">{tree.map((domain) => renderNode(domain))}</div>
      )}
    </div>
  )
}
