import { useState, useRef } from 'react'
import { files } from '../data/mockData'
import { 
  FileVideo, 
  FileAudio, 
  FileText, 
  FileImage,
  Upload,
  Search,
  Filter,
  Play,
  Pause,
  Eye,
  Clock,
  HardDrive,
  X,
  Tag,
  Volume2
} from 'lucide-react'

function FilesPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return <FileVideo className="w-5 h-5 text-red-400" />
      case 'audio': return <FileAudio className="w-5 h-5 text-purple-400" />
      case 'document': return <FileText className="w-5 h-5 text-blue-400" />
      case 'image': return <FileImage className="w-5 h-5 text-green-400" />
      default: return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'วิดีโอ'
      case 'audio': return 'เสียง'
      case 'document': return 'เอกสาร'
      case 'image': return 'ภาพ'
      default: return 'อื่นๆ'
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || file.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="h-full flex">
      {/* File List */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-fbi-dark border-b border-fbi-border p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fbi-muted" />
              <input
                type="text"
                placeholder="ค้นหาไฟล์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-fbi-navy border border-fbi-border rounded pl-10 pr-4 py-2 text-sm text-white placeholder-fbi-muted focus:outline-none focus:border-fbi-accent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-fbi-muted" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-fbi-navy border border-fbi-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-fbi-accent"
              >
                <option value="all">ทุกประเภท</option>
                <option value="video">วิดีโอ</option>
                <option value="audio">เสียง</option>
                <option value="document">เอกสาร</option>
                <option value="image">ภาพ</option>
              </select>
            </div>

            {/* Upload Button */}
            <button className="flex items-center gap-2 bg-fbi-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" />
              อัพโหลดไฟล์
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="border-b border-fbi-border border-dashed m-4 p-8 rounded-lg bg-fbi-navy/30 text-center">
          <Upload className="w-12 h-12 text-fbi-muted mx-auto mb-2" />
          <p className="text-fbi-muted text-sm">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          <p className="text-fbi-muted/60 text-xs mt-1">รองรับ: MP4, MP3, PDF, JPG, PNG</p>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className={`bg-fbi-navy border rounded-lg p-4 cursor-pointer transition-all hover:border-fbi-accent ${
                  selectedFile?.id === file.id ? 'border-fbi-accent glow-blue' : 'border-fbi-border'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-fbi-dark rounded mb-3 flex items-center justify-center relative overflow-hidden">
                  {file.thumbnail ? (
                    <>
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {file.type === 'video' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-fbi-dark to-transparent" />
                          <Play className="w-10 h-10 text-white/70 relative z-10" />
                          <span className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-1 rounded z-10">
                            {file.duration}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {file.type === 'video' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-fbi-dark to-transparent" />
                          <Play className="w-10 h-10 text-white/50" />
                          <span className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-1 rounded">
                            {file.duration}
                          </span>
                        </>
                      )}
                      {file.type === 'audio' && (
                        <FileAudio className="w-12 h-12 text-purple-400" />
                      )}
                      {file.type === 'document' && (
                        <FileText className="w-12 h-12 text-blue-400" />
                      )}
                      {file.type === 'image' && (
                        <FileImage className="w-12 h-12 text-green-400" />
                      )}
                    </>
                  )}
                </div>

                {/* File Info */}
                <div className="flex items-start gap-2">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-fbi-muted">
                      <span>{file.size}</span>
                      {file.duration && (
                        <>
                          <span>•</span>
                          <span>{file.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-fbi-dark border-t border-fbi-border px-4 py-2 flex items-center gap-6 text-xs text-fbi-muted">
          <span>📁 ไฟล์ทั้งหมด: {files.length}</span>
          <span>📹 วิดีโอ: {files.filter(f => f.type === 'video').length}</span>
          <span>🎤 เสียง: {files.filter(f => f.type === 'audio').length}</span>
          <span>📄 เอกสาร: {files.filter(f => f.type === 'document').length}</span>
          <span>🖼️ ภาพ: {files.filter(f => f.type === 'image').length}</span>
        </div>
      </div>

      {/* File Detail Panel */}
      {selectedFile && (
        <div className="w-96 bg-fbi-dark border-l border-fbi-border flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-fbi-border">
            <h3 className="text-sm font-medium text-white">รายละเอียดไฟล์</h3>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-fbi-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Preview */}
            <div className="aspect-video bg-fbi-navy rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              {selectedFile.thumbnail ? (
                <>
                  <img 
                    src={selectedFile.thumbnail} 
                    alt={selectedFile.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {selectedFile.type === 'video' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-fbi-dark/80 to-transparent" />
                      <Play className="w-12 h-12 text-white/70 relative z-10" />
                    </>
                  )}
                  {selectedFile.type === 'audio' && selectedFile.url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50">
                      <div className="w-20 h-20 bg-purple-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Volume2 className="w-10 h-10 text-purple-300" />
                      </div>
                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                      <div className="w-full text-center px-4">
                        <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-gray-300 text-xs">{selectedFile.duration}</p>
                      </div>
                      <audio
                        ref={audioRef}
                        src={selectedFile.url}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedFile.type === 'video' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-fbi-dark to-transparent" />
                      <Play className="w-12 h-12 text-white/30" />
                    </>
                  )}
                  {selectedFile.type === 'audio' && selectedFile.url && (
                    <div className="flex flex-col items-center gap-4 w-full px-8">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Volume2 className="w-10 h-10 text-purple-400" />
                      </div>
                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                      <div className="w-full text-center">
                        <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-fbi-muted text-xs">{selectedFile.duration}</p>
                      </div>
                      <audio
                        ref={audioRef}
                        src={selectedFile.url}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}
                  {selectedFile.type === 'audio' && !selectedFile.url && (
                    <FileAudio className="w-12 h-12 text-purple-400" />
                  )}
                  {selectedFile.type === 'document' && (
                    <FileText className="w-12 h-12 text-blue-400" />
                  )}
                  {selectedFile.type === 'image' && (
                    <FileImage className="w-12 h-12 text-green-400" />
                  )}
                </>
              )}
            </div>

            {/* File Name */}
            <h4 className="text-white font-medium mb-4">{selectedFile.name}</h4>

            {/* Meta Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-fbi-muted" />
                <span className="text-fbi-muted">ขนาด:</span>
                <span className="text-white">{selectedFile.size}</span>
              </div>
              {selectedFile.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-fbi-muted" />
                  <span className="text-fbi-muted">ความยาว:</span>
                  <span className="text-white">{selectedFile.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-fbi-muted" />
                <span className="text-fbi-muted">เพิ่มเมื่อ:</span>
                <span className="text-white">{selectedFile.dateAdded}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-fbi-border">
              <h5 className="text-xs font-medium text-fbi-muted mb-2">คำอธิบาย</h5>
              <p className="text-sm text-white">{selectedFile.description}</p>
            </div>

            {/* Tags */}
            <div className="mt-4 pt-4 border-t border-fbi-border">
              <h5 className="text-xs font-medium text-fbi-muted mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> แท็ก
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedFile.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-fbi-navy rounded text-xs text-fbi-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="mt-4 pt-4 border-t border-fbi-border">
              <h5 className="text-xs font-medium text-fbi-accent mb-2">🤖 สรุปโดย AI</h5>
              <p className="text-sm text-gray-300">{selectedFile.aiSummary}</p>
            </div>

            {/* Transcription */}
            {selectedFile.transcription && selectedFile.transcription !== '-' && (
              <div className="mt-4 pt-4 border-t border-fbi-border">
                <h5 className="text-xs font-medium text-fbi-warning mb-2">📝 ถอดความ</h5>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-fbi-navy p-3 rounded font-mono">
                  {selectedFile.transcription}
                </pre>
              </div>
            )}

            {/* Related Characters */}
            {selectedFile.relatedCharacters.length > 0 && (
              <div className="mt-4 pt-4 border-t border-fbi-border">
                <h5 className="text-xs font-medium text-fbi-muted mb-2">👤 บุคคลที่เกี่ยวข้อง</h5>
                <div className="space-y-2">
                  {selectedFile.relatedCharacters.map((charId) => (
                    <div key={charId} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-fbi-navy rounded-full" />
                      <span className="text-white">{charId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel Actions */}
          <div className="p-4 border-t border-fbi-border flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-fbi-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              <Eye className="w-4 h-4" />
              ดูรายละเอียด
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-fbi-navy hover:bg-fbi-blue text-white px-4 py-2 rounded text-sm">
              <Play className="w-4 h-4" />
              เล่น
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilesPage
