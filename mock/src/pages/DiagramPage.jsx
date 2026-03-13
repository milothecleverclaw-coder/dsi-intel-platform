import { useState, useEffect, useRef, useCallback } from 'react'
import { characters, relationships, files } from '../data/mockData'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  User,
  FileText,
  Link2,
  Filter
} from 'lucide-react'

function DiagramPage() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [hoveredNode, setHoveredNode] = useState(null)

  // Calculate node positions in a circular layout
  const calculatePositions = () => {
    const centerX = 400
    const centerY = 300
    const radius = 200

    const allNodes = [
      ...characters.map(c => ({ ...c, type: 'character' })),
      ...files.slice(0, 4).map(f => ({ ...f, type: 'file' }))
    ]

    return allNodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / allNodes.length - Math.PI / 2
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })
  }

  const [nodes, setNodes] = useState(calculatePositions())

  // Get canvas coordinates from mouse event
  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = 800 / rect.width
    const scaleY = 600 / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }, [])

  // Calculate distance from point to line segment
  const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) {
      param = dot / lenSq
    }

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate distance from point to quadratic bezier curve
  const distanceToQuadraticCurve = (px, py, x0, y0, xc, yc, x1, y1) => {
    let minDist = Infinity
    const steps = 25
    let prevX = x0
    let prevY = y0

    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * xc + t * t * x1
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1
      
      const dist = distanceToLineSegment(px, py, prevX, prevY, bx, by)
      minDist = Math.min(minDist, dist)
      
      prevX = bx
      prevY = by
    }
    return minDist
  }

  // Get connected relationships for a node
  const getConnectedRelationships = useCallback((nodeId) => {
    return relationships.filter(r => r.from === nodeId || r.to === nodeId)
  }, [])

  // Handle mouse move for hover detection
  const handleCanvasMouseMove = useCallback((e) => {
    const { x, y } = getCanvasCoords(e)

    // Find hovered node
    const node = nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) < 35
    })
    setHoveredNode(node || null)

    // Update cursor
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = node ? 'pointer' : 'default'
    }
  }, [nodes, getCanvasCoords])

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const { x, y } = getCanvasCoords(e)

    const clickedNode = nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) < 35
    })

    setSelectedNode(clickedNode || null)
  }, [nodes, getCanvasCoords])

  // Draw the diagram
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Clear and set background
    ctx.fillStyle = '#0a0e17'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save context for zoom
    ctx.save()
    ctx.scale(zoom, zoom)

    // Draw grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5 / zoom
    for (let x = 0; x < 800; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 600)
      ctx.stroke()
    }
    for (let y = 0; y < 600; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(800, y)
      ctx.stroke()
    }

    // Get highlighted node (selected or hovered)
    const highlightedNode = selectedNode || hoveredNode
    const connectedRelIds = highlightedNode 
      ? new Set(getConnectedRelationships(highlightedNode.id).map(r => r.id))
      : new Set()

    // Draw connections - only show related lines when node is highlighted
    relationships.forEach((rel) => {
      const fromNode = nodes.find(n => n.id === rel.from)
      const toNode = nodes.find(n => n.id === rel.to)
      if (!fromNode || !toNode) return

      // Only show line if it's connected to highlighted node, or if no node is highlighted
      const isConnected = connectedRelIds.has(rel.id)
      
      if (highlightedNode && !isConnected) {
        // Dimmed line for unrelated connections
        ctx.beginPath()
        ctx.strokeStyle = '#0f1629'
        ctx.lineWidth = 1
        const midX = (fromNode.x + toNode.x) / 2
        const midY = (fromNode.y + toNode.y) / 2 - 20
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
        ctx.stroke()
        return
      }

      // Highlighted/normal line
      ctx.beginPath()
      ctx.strokeStyle = isConnected ? '#3b82f6' : '#1e3a5f'
      ctx.lineWidth = isConnected ? 2 : 1
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
      ctx.stroke()

      // Draw label for connected lines
      if (isConnected) {
        ctx.fillStyle = '#3b82f6'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(rel.label, midX, midY - 5)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id
      const isHovered = hoveredNode?.id === node.id
      const isConnected = highlightedNode && 
        relationships.some(r => 
          (r.from === highlightedNode.id && r.to === node.id) ||
          (r.to === highlightedNode.id && r.from === node.id)
        )

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isSelected ? 30 : 25, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? '#3b82f6' : isConnected ? '#1e3a5f' : '#1a2332'
      ctx.fill()
      ctx.strokeStyle = isSelected ? '#60a5fa' : isHovered ? '#93c5fd' : isConnected ? '#3b82f6' : '#1e293b'
      ctx.lineWidth = isSelected ? 3 : isHovered ? 3 : 2
      ctx.stroke()

      // Node icon
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isSelected || isHovered || isConnected ? '#ffffff' : '#64748b'
      
      if (node.type === 'character') {
        ctx.fillText('👤', node.x, node.y)
      } else {
        ctx.fillText('📁', node.x, node.y)
      }

      // Node label
      ctx.fillStyle = isConnected || isSelected || isHovered ? '#ffffff' : '#64748b'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      const label = node.type === 'character' 
        ? (node.alias || node.name.split(' ')[0]) 
        : node.name.split('.')[0]
      ctx.fillText(label, node.x, node.y + 40)
    })

    ctx.restore()

  }, [nodes, selectedNode, hoveredNode, zoom, getConnectedRelationships])

  return (
    <div className="h-full flex">
      {/* Diagram Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar - Fixed */}
        <div className="bg-fbi-dark border-b border-fbi-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-gray-300 hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-gray-300 hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1); setNodes(calculatePositions()) }}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-gray-300 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setNodes(calculatePositions())}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-gray-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-300 ml-2">Zoom: {Math.round(zoom * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-fbi-navy border border-fbi-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-fbi-accent"
              >
                <option value="all">แสดงทั้งหมด</option>
                <option value="character">เฉพาะตัวละคร</option>
                <option value="file">เฉพาะไฟล์</option>
                <option value="financial">เฉพาะการเงิน</option>
              </select>
            </div>
          </div>
        </div>

        {/* Canvas Container - Grows to fill space, scrollable */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-auto bg-fbi-darker relative min-h-0"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="cursor-pointer block"
            style={{ 
              width: `${800 * zoom}px`,
              height: `${600 * zoom}px`,
            }}
          />
        </div>

        {/* Legend - Fixed at bottom */}
        <div className="bg-fbi-dark border-t border-fbi-border px-4 py-2 flex items-center gap-6 text-xs flex-shrink-0">
          <span className="text-gray-300">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-fbi-accent rounded-full" />
            <span className="text-white">ตัวละคร</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-white">ไฟล์</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-fbi-accent" />
            <span className="text-white">ความสัมพันธ์</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-80 bg-fbi-dark border-l border-fbi-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-fbi-border">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-fbi-accent" />
            {selectedNode ? 'รายละเอียด' : 'เลือกโหนด'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-fbi-navy rounded-lg flex items-center justify-center">
                  {selectedNode.type === 'character' 
                    ? <User className="w-6 h-6 text-fbi-accent" />
                    : <FileText className="w-6 h-6 text-purple-400" />
                  }
                </div>
                <div>
                  <h4 className="text-white font-medium">{selectedNode.name}</h4>
                  <p className="text-xs text-gray-300">
                    {selectedNode.type === 'character' ? 'ตัวละคร' : 'ไฟล์'}
                  </p>
                </div>
              </div>

              {selectedNode.type === 'character' && (
                <>
                  {selectedNode.alias && (
                    <p className="text-fbi-accent text-sm mb-2">"{selectedNode.alias}"</p>
                  )}
                  <p className="text-sm text-gray-200 mb-4">{selectedNode.role}</p>
                </>
              )}

              {/* Connections */}
              <div className="pt-4 border-t border-fbi-border">
                <h5 className="text-xs font-medium text-gray-300 mb-3">ความสัมพันธ์</h5>
                <div className="space-y-2">
                  {relationships
                    .filter(r => r.from === selectedNode.id || r.to === selectedNode.id)
                    .slice(0, 5)
                    .map((rel, idx) => {
                      const otherId = rel.from === selectedNode.id ? rel.to : rel.from
                      const other = nodes.find(n => n.id === otherId)
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-fbi-navy p-2 rounded">
                          <span className="text-fbi-accent">→</span>
                          <span className="text-white truncate">{other?.name || otherId}</span>
                          <span className="text-gray-300 text-xs ml-auto">{rel.label}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-300 py-8">
              <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>คลิกที่โหนดเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-fbi-border text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-fbi-navy p-2 rounded">
              <span className="text-gray-300 block">โหนด</span>
              <span className="text-white font-medium">{nodes.length}</span>
            </div>
            <div className="bg-fbi-navy p-2 rounded">
              <span className="text-gray-300 block">เส้นเชื่อม</span>
              <span className="text-white font-medium">{relationships.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagramPage