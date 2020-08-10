const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let MyVideoStream
const myVideo = document.createElement('video')
myVideo.setAttribute('autoplay', '')
myVideo.setAttribute('playsinline', '')
myVideo.muted = true

const constraints = {
  video: true,
  audio: true
}
const messages = document.getElementsByClassName('messages')[0]
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

getMedia(constraints)

peer.on('open', id => {
  socket.emit('join-room', roomId, id)
})

socket.on('createMessage', async message => {
  let msg = document.createElement('li')
  msg.innerText = await message
  messages.appendChild(msg)
  scrollToButton()
})

async function getMedia(constraints) {
  let stream = null
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints)
    MyVideoStream = stream
    addVideoStream(myVideo, stream)
    peer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      myVideo.muted = true
      video.setAttribute('autoplay', '')
      video.setAttribute('playsinline', '')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream)
    })
  } catch (err) {
    window.alert(err)
  }
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream

  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.appendChild(video)
}

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}

const sendMessage = () => {
  let msg = document.getElementById('chat_message')
  socket.emit('message', msg.value)
  msg.value = ''
  return false
}

const scrollToButton = () => {
  const d = document.getElementsByClassName('main__chat_window')[0]
  d.scrollTop = d.scrollHeight
}

const muteUnmute = () => {
  const enabled = MyVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    MyVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    MyVideoStream.getAudioTracks()[0].enabled = true
  }
}

const setMuteButton = () => {
  const html = '<i class="fas fa-microphone"></i><span>Mute</span>'
  document.getElementsByClassName('main__mute_button')[0].innerHTML = html
}
const setUnmuteButton = () => {
  const html = '<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>'
  document.getElementsByClassName('main__mute_button')[0].innerHTML = html
}

const playStop = () => {
  const enabled = MyVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    MyVideoStream.getVideoTracks()[0].enabled = false
    setPlayVideo()
  } else {
    setStopVideo()
    MyVideoStream.getVideoTracks()[0].enabled = true
  }
}

const setStopVideo = () => {
  const html = '<i class="fas fa-video"></i><span>Stop Video</span>'
  document.getElementsByClassName('main__play_button')[0].innerHTML = html
}

const setPlayVideo = () => {
  const html = '<i class="stop fas fa-video-slash"></i><span>Play Video</span>'
  document.getElementsByClassName('main__play_button')[0].innerHTML = html
}
