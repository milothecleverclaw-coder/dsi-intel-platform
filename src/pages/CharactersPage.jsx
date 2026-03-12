import { useState } from 'react'
import { characters } from '../data/mockData'
import {
  User,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Link2,
  Shield,
  X,
  Edit2,
  UserPlus
} from 'lucide-react'

function CharactersPage() {
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30'
      default: return 'text-gray-300 bg-gray-300/10 border-gray-300/30'
    }
  }

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high': return 'เสี่ยงสูง'
      case 'medium': return 'เสี่ยงปานกลาง'
      case 'low': return 'เสี่ยงต่ำ'
      default: return 'ไม่ระบุ'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'suspect': return 'text-red-400'
      case 'person-of-interest': return 'text-yellow-400'
      case 'witness': return 'text-blue-400'
      default: return 'text-gray-300'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'suspect': return 'ผู้ต้องสงสัย'
      case 'person-of-interest': return 'บุคคลที่น่าสนใจ'
      case 'witness': return 'พยาน'
      default: return 'ไม่ระบุ'
    }
  }

  const filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (char.alias && char.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRisk = filterRisk === 'all' || char.riskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  const getCharacterById = (id) => characters.find(c => c.id === id)

  return (
    <div className="h-full flex">
      {/* Character List */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-fbi-dark border-b border-fbi-border p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="ค้นหาตัวละคร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-fbi-navy border border-fbi-border rounded pl-10 pr-4 py-2 text-sm text-white placeholder-fbi-muted focus:outline-none focus:border-fbi-accent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="bg-fbi-navy border border-fbi-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-fbi-accent"
              >
                <option value="all">ทุกระดับความเสี่ยง</option>
                <option value="high">เสี่ยงสูง</option>
                <option value="medium">เสี่ยงปานกลาง</option>
                <option value="low">เสี่ยงต่ำ</option>
              </select>
            </div>

            {/* Add Button */}
            <button className="flex items-center gap-2 bg-fbi-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              <UserPlus className="w-4 h-4" />
              เพิ่มตัวละคร
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharacters.map((char) => (
              <div
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`bg-fbi-navy border rounded-lg p-4 cursor-pointer transition-all hover:border-fbi-accent ${
                  selectedCharacter?.id === char.id ? 'border-fbi-accent glow-blue' : 'border-fbi-border'
                }`}
              >
                {/* Avatar */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-20 h-20 bg-fbi-dark rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <User className="w-10 h-10 text-gray-300 hidden" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{char.name}</h3>
                    {char.alias && (
                      <p className="text-fbi-accent text-sm">"{char.alias}"</p>
                    )}
                    <p className="text-gray-300 text-xs mt-1">{char.role}</p>
                  </div>
                </div>

                {/* Status & Risk */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded border ${getRiskColor(char.riskLevel)}`}>
                    {getRiskLabel(char.riskLevel)}
                  </span>
                  <span className={`text-xs ${getStatusColor(char.status)}`}>
                    {getStatusLabel(char.status)}
                  </span>
                </div>

                {/* Connections */}
                <div className="mt-3 pt-3 border-t border-fbi-border flex items-center gap-2 text-xs text-gray-300">
                  <Link2 className="w-3 h-3" />
                  <span>เชื่อมโยง {char.connections.length} คน</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-fbi-dark border-t border-fbi-border px-4 py-2 flex items-center gap-6 text-xs text-gray-300">
          <span>👤 ตัวละครทั้งหมด: {characters.length}</span>
          <span className="text-red-400">🔴 เสี่ยงสูง: {characters.filter(c => c.riskLevel === 'high').length}</span>
          <span className="text-yellow-400">🟡 เสี่ยงปานกลาง: {characters.filter(c => c.riskLevel === 'medium').length}</span>
          <span className="text-green-400">🟢 เสี่ยงต่ำ: {characters.filter(c => c.riskLevel === 'low').length}</span>
        </div>
      </div>

      {/* Character Detail Panel */}
      {selectedCharacter && (
        <div className="w-96 bg-fbi-dark border-l border-fbi-border flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-fbi-border">
            <h3 className="text-sm font-medium text-white">รายละเอียดตัวละคร</h3>
            <button
              onClick={() => setSelectedCharacter(null)}
              className="text-gray-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-fbi-navy rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                <img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <User className="w-16 h-16 text-gray-300 hidden" />
              </div>
              <h4 className="text-white font-medium text-lg">{selectedCharacter.name}</h4>
              {selectedCharacter.alias && (
                <p className="text-fbi-accent">"{selectedCharacter.alias}"</p>
              )}
              <p className="text-gray-300 text-sm">{selectedCharacter.role}</p>
            </div>

            {/* Status Badges */}
            <div className="flex justify-center gap-2 mb-6">
              <span className={`text-xs px-3 py-1 rounded border ${getRiskColor(selectedCharacter.riskLevel)}`}>
                {getRiskLabel(selectedCharacter.riskLevel)}
              </span>
              <span className={`text-xs px-3 py-1 rounded bg-fbi-navy ${getStatusColor(selectedCharacter.status)}`}>
                {getStatusLabel(selectedCharacter.status)}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">พบครั้งแรก:</span>
                <span className="text-white">{selectedCharacter.firstSeen}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">กิจกรรมล่าสุด:</span>
                <span className="text-white">{selectedCharacter.lastActivity}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> บันทึก
              </h5>
              <p className="text-sm text-gray-200">{selectedCharacter.notes}</p>
            </div>

            {/* Connections */}
            <div className="pt-4 border-t border-fbi-border">
              <h5 className="text-xs font-medium text-gray-300 mb-3 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> เชื่อมโยงกับ ({selectedCharacter.connections.length})
              </h5>
              <div className="space-y-2">
                {selectedCharacter.connections.map((connId) => {
                  const conn = getCharacterById(connId)
                  if (!conn) return null
                  return (
                    <div
                      key={connId}
                      className="flex items-center gap-3 p-2 bg-fbi-navy rounded cursor-pointer hover:bg-fbi-blue transition-colors"
                      onClick={() => setSelectedCharacter(conn)}
                    >
                      <div className="w-8 h-8 bg-fbi-dark rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={conn.image} 
                          alt={conn.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <User className="w-4 h-4 text-gray-300 hidden" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{conn.name}</p>
                        <p className="text-xs text-gray-300">{conn.role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Panel Actions */}
          <div className="p-4 border-t border-fbi-border">
            <button className="w-full flex items-center justify-center gap-2 bg-fbi-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              <Shield className="w-4 h-4" />
              ดูประวัติเต็ม
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CharactersPage
