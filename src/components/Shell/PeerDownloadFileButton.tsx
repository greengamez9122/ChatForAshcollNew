import Download from '@mui/icons-material/Download'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import { useContext, useState } from 'react'

import { ShellContext } from 'contexts/ShellContext'
import { isError } from 'lib/type-guards'
import { Peer } from 'models/chat'

import { usePeerNameDisplay } from 'components/PeerNameDisplay/usePeerNameDisplay'
import { RoomContext } from 'contexts/RoomContext'

interface PeerDownloadFileButtonProps {
  peer: Peer
}

export const PeerDownloadFileButton = ({
  peer,
}: PeerDownloadFileButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const shellContext = useContext(ShellContext)
  const {
    fileTransferService: { fileTransfer },
  } = useContext(RoomContext)
  const { getDisplayUsername } = usePeerNameDisplay()
  const { offeredFileId } = peer

  const onProgress = (progress: number) => {
    setDownloadProgress(progress * 100)
  }

  if (!offeredFileId) {
    return <></>
  }

  const handleDownloadFileClick = async () => {
    setIsDownloading(true)
    setDownloadProgress(null)

    try {
      if (typeof shellContext.roomId !== 'string') {
        throw new Error('shellContext.roomId is not a string')
      }

      await fileTransfer.download(offeredFileId, shellContext.roomId, {
        doSave: true,
        onProgress,
      })
    } catch (e) {
      if (isError(e)) {
        shellContext.showAlert(e.message, {
          severity: 'error',
        })
      }
    }

    setIsDownloading(false)
    setDownloadProgress(null)
  }

  return (
    <Box className="PeerDownloadFileButton" sx={{ mr: 2 }}>
      {isDownloading ? (
        <CircularProgress
          variant={downloadProgress === null ? 'indeterminate' : 'determinate'}
          value={downloadProgress === null ? undefined : downloadProgress}
          sx={{
            transition: 'none',
          }}
        />
      ) : (
        <Tooltip
          title={`Download files being offered by ${getDisplayUsername(
            peer.userId
          )}`}
        >
          <Fab color="primary" size="small" onClick={handleDownloadFileClick}>
            <Download />
          </Fab>
        </Tooltip>
      )}
    </Box>
  )
}
