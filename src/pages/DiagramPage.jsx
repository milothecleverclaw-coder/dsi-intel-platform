import { useState, useEffect, useRef } from 'react'
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
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [hoveredConnection, setHoveredConnection] = useState(null)

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

  // Draw the diagram
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#0a0e17'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw connections
    relationships.forEach((rel) => {
      const fromNode = nodes.find(n => n.id === rel.from)
      const toNode = nodes.find(n => n.id === rel.to)
      if (!fromNode || !toNode) return

      const isHovered = hoveredConnection === rel
      const isHighlighted = selectedNode && 
        (selectedNode.id === rel.from || selectedNode.id === rel.to)

      ctx.beginPath()
      ctx.strokeStyle = isHovered || isHighlighted ? '#3b82f6' : '#1e3a5f'
      ctx.lineWidth = isHovered || isHighlighted ? 2 : 1

      // Draw curved line
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
      ctx.stroke()

      // Draw label
      if (isHovered || isHighlighted) {
        ctx.fillStyle = '#3b82f6'
        ctx.font = '10px JetBrains Mono'
        ctx.fillText(rel.label, midX - 20, midY)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id
      const isConnected = selectedNode && 
        relationships.some(r => 
          (r.from === selectedNode.id && r.to === node.id) ||
          (r.to === selectedNode.id && r.from === node.id)
        )

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isSelected ? 30 : 25, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? '#3b82f6' : isConnected ? '#1e3a5f' : '#1a2332'
      ctx.fill()
      ctx.strokeStyle = isSelected ? '#60a5fa' : isConnected ? '#3b82f6' : '#1e293b'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()

      // Node icon
      ctx.fillStyle = isSelected || isConnected ? '#ffffff' : '#64748b'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (node.type === 'character') {
        ctx.fillText('👤', node.x, node.y)
      } else {
        ctx.fillText('📁', node.x, node.y)
      }

      // Node label
      ctx.fillStyle = '#ffffff'
      ctx.font = '11px JetBrains Mono'
      ctx.fillText(
        node.type === 'character' 
          ? (node.alias || node.name.split(' ')[0]) 
          : node.name.split('.')[0],
        node.x,
        node.y + 40
      )
    })

  }, [nodes, selectedNode, hoveredConnection, relationships])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 30
    })

    setSelectedNode(clickedNode || null)
  }

  // Calculate distance from point to quadratic bezier curve (approximate)
  const distanceToQuadraticCurve = (px, py, x0, y0, xc, yc, x1, y1) => {
    // Sample points along the curve and find minimum distance
    let minDist = Infinity
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      // Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * Pc + t^2 * P1
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * xc + t * t * x1
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1
      const dist = Math.sqrt((px - bx) ** 2 + (py - by) ** 2)
      minDist = Math.min(minDist, dist)
    }
    return minDist
  }

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    // Find hovered connection
    let found = null
    let minDist = Infinity
    relationships.forEach((rel) => {
      const fromNode = nodes.find(n => n.id === rel.from)
      const toNode = nodes.find(n => n.id === rel.to)
      if (!fromNode || !toNode) return

      // Calculate control point for quadratic curve
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20

      // Check distance to the curved line
      const dist = distanceToQuadraticCurve(x, y, fromNode.x, fromNode.y, midX, midY, toNode.x, toNode.y)
      if (dist < 15 && dist < minDist) {
        minDist = dist
        found = rel
      }
    })

    setHoveredConnection(found)

    // Change cursor if hovering over a connection or node
    const hoveredNode = nodes.find(node => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 30
    })

    canvas.style.cursor = (found || hoveredNode) ? 'pointer' : 'default'
  }

  return (
    <div className="h-full flex">
      {/* Diagram Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-fbi-dark border-b border-fbi-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-fbi-muted hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-fbi-muted hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1); setNodes(calculatePositions()) }}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-fbi-muted hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setNodes(calculatePositions())}
                className="p-2 bg-fbi-navy hover:bg-fbi-blue rounded text-fbi-muted hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className="text-xs text-fbi-muted ml-2">Zoom: {Math.round(zoom * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-fbi-muted" />
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

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full cursor-pointer"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          />
        </div>

        {/* Legend */}
        <div className="bg-fbi-dark border-t border-fbi-border px-4 py-2 flex items-center gap-6 text-xs">
          <span className="text-fbi-muted">Legend:</span>
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
      <div className="w-80 bg-fbi-dark border-l border-fbi-border flex flex-col">
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
                  <p className="text-xs text-fbi-muted">
                    {selectedNode.type === 'character' ? 'ตัวละคร' : 'ไฟล์'}
                  </p>
                </div>
              </div>

              {selectedNode.type === 'character' && (
                <>
                  {selectedNode.alias && (
                    <p className="text-fbi-accent text-sm mb-2">"{selectedNode.alias}"</p>
                  )}
                  <p className="text-sm text-gray-300 mb-4">{selectedNode.role}</p>
                </>
              )}

              {/* Connections */}
              <div className="pt-4 border-t border-fbi-border">
                <h5 className="text-xs font-medium text-fbi-muted mb-3">ความสัมพันธ์</h5>
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
                          <span className="text-fbi-muted text-xs ml-auto">{rel.label}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-fbi-muted py-8">
              <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>คลิกที่โหนดเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-fbi-border text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-fbi-navy p-2 rounded">
              <span className="text-fbi-muted block">โหนด</span>
              <span className="text-white font-medium">{nodes.length}</span>
            </div>
            <div className="bg-fbi-navy p-2 rounded">
              <span className="text-fbi-muted block">เส้นเชื่อม</span>
              <span className="text-white font-medium">{relationships.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagramPage
