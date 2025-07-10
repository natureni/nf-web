import React from 'react'
import { Project } from '../../types/project'

interface ProjectStatsProps {
  projects: Project[]
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
  const totalProjects = projects.length
  const reportingCount = projects.filter(p => p.status === 'reporting').length
  const modelingCount = projects.filter(p => p.status === 'modeling').length
  const renderingCount = projects.filter(p => p.status === 'rendering').length
  const deliveringCount = projects.filter(p => p.status === 'delivering').length
  const pausedCount = projects.filter(p => p.status === 'paused').length

  return (
    <div style={{ 
      marginBottom: 24, 
      display: 'flex', 
      gap: 16,
      padding: '16px 0',
      flexWrap: 'wrap'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        minWidth: '120px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalProjects}</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>总项目数</div>
      </div>
      
      {reportingCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{reportingCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>报备中</div>
        </div>
      )}
      
      {modelingCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{modelingCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>建模中</div>
        </div>
      )}
      
      {renderingCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{renderingCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>渲染中</div>
        </div>
      )}
      
      {deliveringCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{deliveringCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>交付中</div>
        </div>
      )}
      
      {pausedCount > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #8c8c8c 0%, #595959 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          minWidth: '120px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pausedCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>暂停中</div>
        </div>
      )}
    </div>
  )
}

export default ProjectStats 