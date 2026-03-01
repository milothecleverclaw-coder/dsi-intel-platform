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
  const [hoveredConnection, setHoveredConnection] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

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
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    }
  }, [zoom])

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
    const steps = 30
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

  // Handle mouse move for hover detection
  const handleCanvasMouseMove = useCallback((e) => {
    const { x, y } = getCanvasCoords(e)
    setMousePos({ x: e.clientX, y: e.clientY })

    // Find hovered node (larger hit area - 40px radius)
    const node = nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) < 40
    })
    setHoveredNode(node || null)

    // Find hovered connection
    let connection = null
    let minDist = Infinity

    relationships.forEach((rel) => {
      const fromNode = nodes.find(n => n.id === rel.from)
      const toNode = nodes.find(n => n.id === rel.to)
      if (!fromNode || !toNode) return

      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20

      const dist = distanceToQuadraticCurve(x, y, fromNode.x, fromNode.y, midX, midY, toNode.x, toNode.y)
      // Larger hit area for lines (25px)
      if (dist < 25 && dist < minDist) {
        minDist = dist
        connection = rel
      }
    })
    setHoveredConnection(connection)

    // Update cursor
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = (node || connection) ? 'pointer' : 'default'
    }
  }, [nodes, getCanvasCoords])

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const { x, y } = getCanvasCoords(e)

    // First check nodes
    const clickedNode = nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) < 40
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      return
    }

    // Check connections
    let clickedConnection = null
    let minDist = Infinity

    relationships.forEach((rel) => {
      const fromNode = nodes.find(n => n.id === rel.from)
      const toNode = nodes.find(n => n.id === rel.to)
      if (!fromNode || !toNode) return

      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20

      const dist = distanceToQuadraticCurve(x, y, fromNode.x, fromNode.y, midX, midY, toNode.x, toNode.y)
      if (dist < 25 && dist < minDist) {
        minDist = dist
        clickedConnection = rel
      }
    })

    // If clicked on connection, select one of its nodes
    if (clickedConnection) {
      const fromNode = nodes.find(n => n.id === clickedConnection.from)
      setSelectedNode(fromNode || null)
    } else {
      setSelectedNode(null)
    }
  }, [nodes, getCanvasCoords])

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

      const isHovered = hoveredConnection?.id === rel.id
      const isHighlighted = selectedNode && 
        (selectedNode.id === rel.from || selectedNode.id === rel.to)

      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2 - 20

      // Draw thick invisible hit area first
      ctx.beginPath()
      ctx.strokeStyle = 'transparent'
      ctx.lineWidth = 30
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
      ctx.stroke()

      // Draw visible line
      ctx.beginPath()
      ctx.strokeStyle = isHovered ? '#60a5fa' : isHighlighted ? '#3b82f6' : '#1e3a5f'
      ctx.lineWidth = isHovered ? 4 : isHighlighted ? 3 : 2
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y)
      ctx.stroke()

      // Draw arrow at midpoint
      if (isHovered || isHighlighted) {
        ctx.fillStyle = isHovered ? '#60a5fa' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(midX, midY, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id
      const isHovered = hoveredNode?.id === node.id
      const isConnected = selectedNode && 
        relationships.some(r => 
          (r.from === selectedNode.id && r.to === node.id) ||
          (r.to === selectedNode.id && r.from === node.id)
        )

      // Hover glow effect
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 45, 0, 2 * Math.PI)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isSelected ? 35 : 28, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? '#3b82f6' : isHovered ? '#2563eb' : isConnected ? '#1e3a5f' : '#1a2332'
      ctx.fill()
      
      // Node border
      ctx.strokeStyle = isSelected ? '#60a5fa' : isHovered ? '#93c5fd' : isConnected ? '#3b82f6' : '#1e293b'
      ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2
      ctx.stroke()

      // Node icon
      ctx.fillStyle = isSelected || isHovered || isConnected ? '#ffffff' : '#64748b'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (node.type === 'character') {
        ctx.fillText('👤', node.x, node.y)
      } else {
        ctx.fillText('📁', node.x, node.y)
      }

      // Node label background
      const label = node.type === 'character' 
        ? (node.alias || node.name.split(' ')[0]) 
        : node.name.split('.')[0]
      ctx.font = 'bold 12px JetBrains Mono'
      const textWidth = ctx.measureText(label).width
      
      ctx.fillStyle = '#0a0e17'
      ctx.fillRect(node.x - textWidth/2 - 4, node.y + 38, textWidth + 8, 18)
      
      // Node label
      ctx.fillStyle = isHovered || isSelected ? '#60a5fa' : '#ffffff'
      ctx.fillText(label, node.x, node.y + 48)
    })

  }, [nodes, selectedNode, hoveredConnection, hoveredNode, relationships])

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

        {/* Canvas Container */}
        <div ref={containerRef} className="flex-1 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top left',
              imageRendering: 'crisp-edges'
            }}
          />
          
          {/* Hover Tooltip for Connections */}
          {hoveredConnection && (
            <div 
              className="absolute pointer-events-none bg-fbi-navy border border-fbi-accent px-3 py-2 rounded shadow-lg z-10"
              style={{
                left: mousePos.x + 10,
                top: mousePos.y - 40
              }}
            >
              <p className="text-xs text-fbi-accent font-medium">
                {hoveredConnection.label}
              </p>
              <p className="text-xs text-fbi-muted">
                {nodes.find(n => n.id === hoveredConnection.from)?.name} → {nodes.find(n => n.id === hoveredConnection.to)?.name}
              </p>
            </div>
          )}
          
          {/* Hover Tooltip for Nodes */}
          {hoveredNode && !hoveredConnection && (
            <div 
              className="absolute pointer-events-none bg-fbi-navy border border-fbi-accent px-3 py-2 rounded shadow-lg z-10"
              style={{
                left: mousePos.x + 10,
                top: mousePos.y - 40
              }}
            >
              <p className="text-xs text-white font-medium">{hoveredNode.name}</p>
              <p className="text-xs text-fbi-muted">{hoveredNode.type === 'character' ? 'ตัวละคร' : 'ไฟล์'}</p>
            </div>
          )}
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