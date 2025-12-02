// 全局变量
let originalFile = null;
let compressedBlob = null;

// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const originalVideoContainer = document.getElementById('originalVideoContainer');
const originalVideo = document.getElementById('originalVideo');
const originalInfo = document.getElementById('originalInfo');
const originalFileName = document.getElementById('originalFileName');
const originalFileSize = document.getElementById('originalFileSize');
const originalDuration = document.getElementById('originalDuration');
const originalResolution = document.getElementById('originalResolution');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const resolutionSelect = document.getElementById('resolutionSelect');
const compressBtn = document.getElementById('compressBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const compressedVideoContainer = document.getElementById('compressedVideoContainer');
const compressedVideo = document.getElementById('compressedVideo');
const compressedInfo = document.getElementById('compressedInfo');
const compressedFileName = document.getElementById('compressedFileName');
const compressedFileSize = document.getElementById('compressedFileSize');
const compressionRatio = document.getElementById('compressionRatio');
const spaceSaved = document.getElementById('spaceSaved');
const downloadBtn = document.getElementById('downloadBtn');
const comparisonContainer = document.getElementById('comparisonContainer');
const noComparison = document.getElementById('noComparison');
const compareOriginalVideo = document.getElementById('compareOriginalVideo');
const compareCompressedVideo = document.getElementById('compareCompressedVideo');

// 初始化应用
function initApp() {
    // 绑定事件监听器
    bindEventListeners();
    // 初始化质量值显示
    updateQualityValue();
}

// 绑定事件监听器
function bindEventListeners() {
    // 文件上传相关事件
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖放事件
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 压缩设置事件
    qualitySlider.addEventListener('input', updateQualityValue);
    resolutionSelect.addEventListener('change', () => {
        console.log('分辨率已更改:', resolutionSelect.value);
    });
    
    // 压缩按钮事件
    compressBtn.addEventListener('click', handleCompress);
}

// 更新压缩质量显示
function updateQualityValue() {
    qualityValue.textContent = `${qualitySlider.value}%`;
}

// 处理文件选择
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
}

// 拖放事件处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
    }
}

// 处理视频文件
function processFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
        alert('请上传视频文件！');
        return;
    }
    
    // 检查文件大小（限制1GB）
    if (file.size > 1024 * 1024 * 1024) {
        alert('视频文件大小不能超过1GB！');
        return;
    }
    
    originalFile = file;
    
    // 显示原始视频
    displayOriginalVideo(file);
    
    // 启用压缩按钮
    compressBtn.disabled = false;
}

// 显示原始视频
function displayOriginalVideo(file) {
    // 创建视频URL
    const videoURL = URL.createObjectURL(file);
    
    // 设置视频源
    originalVideo.src = videoURL;
    compareOriginalVideo.src = videoURL;
    
    // 显示视频容器
    originalVideoContainer.classList.remove('hidden');
    
    // 加载视频元数据
    originalVideo.onloadedmetadata = () => {
        // 显示视频信息
        originalInfo.classList.remove('hidden');
        originalFileName.textContent = file.name;
        originalFileSize.textContent = formatFileSize(file.size);
        originalDuration.textContent = formatDuration(originalVideo.duration);
        originalResolution.textContent = `${originalVideo.videoWidth} × ${originalVideo.videoHeight}`;
    };
}

// 处理压缩
async function handleCompress() {
    if (!originalFile) return;
    
    // 禁用压缩按钮
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 压缩中...';
    
    // 显示进度条
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    try {
        // 获取压缩设置
        const quality = qualitySlider.value;
        const resolutionScale = parseFloat(resolutionSelect.value);
        
        // 执行压缩
        compressedBlob = await compressVideo(originalFile, quality, resolutionScale);
        
        // 显示压缩结果
        displayCompressedVideo(compressedBlob);
        
        // 显示对比视图
        showComparison();
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert('视频压缩失败，请重试！');
    } finally {
        // 恢复压缩按钮
        compressBtn.disabled = false;
        compressBtn.innerHTML = '<i class="fa fa-cog mr-2"></i> 开始压缩';
        
        // 隐藏进度条
        progressContainer.classList.add('hidden');
    }
}

// 使用MediaRecorder API压缩视频
async function compressVideo(file, quality, resolutionScale) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.playsInline = true;
        // 不要设置muted=true，否则可能影响音频流获取
        
        video.onloadedmetadata = async () => {
            try {
                // 计算新的分辨率
                const newWidth = Math.round(video.videoWidth * resolutionScale);
                const newHeight = Math.round(video.videoHeight * resolutionScale);
                
                // 确保宽高是偶数
                const evenWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1;
                const evenHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1;
                
                // 创建canvas元素用于绘制缩放后的视频
                const canvas = document.createElement('canvas');
                canvas.width = evenWidth;
                canvas.height = evenHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                
                // 使用视频原始帧率，确保视频正常播放
                const frameRate = video.videoFrameRate || 30;
                const frameInterval = 1 / frameRate;
                
                // 创建新的媒体流，包含视频和音频
                const stream = new MediaStream();
                
                // 获取原始视频的媒体流（包含音频和视频）
                await video.play();
                const originalStream = video.captureStream();
                
                // 获取原始视频的音频流
                const audioTracks = originalStream.getAudioTracks();
                // 添加所有音频轨道
                audioTracks.forEach(track => {
                    stream.addTrack(track);
                });
                
                // 获取canvas的视频流
                const videoStream = canvas.captureStream(frameRate);
                // 添加视频轨道
                videoStream.getVideoTracks().forEach(track => {
                    stream.addTrack(track);
                });
                
                // 记录音频轨道数量，用于调试
                console.log(`检测到 ${audioTracks.length} 个音频轨道`);
                
                // 设置视频质量和编码格式，优先选择H.264（更适合移动端）
                let mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2'; // H.264 + AAC
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm;codecs=vp9'; // 备选VP9
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
                    }
                }
                
                const recorder = new MediaRecorder(stream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: calculateBitrate(quality, evenWidth, evenHeight, frameRate)
                });
                
                // 存储录制的视频数据
                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };
                
                // 录制完成时处理数据
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: recorder.mimeType });
                    resolve(blob);
                };
                
                // 开始录制
                recorder.start();
                
                // 更新进度条
                const duration = video.duration;
                
                // 设置视频播放速率为1，确保正常播放
                video.playbackRate = 1;
                
                // 使用ontimeupdate事件在视频实际播放时绘制每一帧
                // 这样可以确保视频的流畅性和同步性
                let lastTime = -1;
                video.ontimeupdate = () => {
                    const currentTime = video.currentTime;
                    
                    // 避免同一帧被绘制多次
                    if (Math.floor(currentTime / frameInterval) !== Math.floor(lastTime / frameInterval)) {
                        // 绘制到canvas
                        ctx.drawImage(video, 0, 0, evenWidth, evenHeight);
                        lastTime = currentTime;
                    }
                    
                    // 更新进度
                    const progress = Math.min(100, Math.round((currentTime / duration) * 100));
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${progress}%`;
                    
                    // 当视频播放完成时停止录制
                    if (currentTime >= duration) {
                        recorder.stop();
                        video.pause();
                        video.ontimeupdate = null; // 移除事件监听
                    }
                };
                
                // 开始播放视频
                video.play();
                
            } catch (error) {
                reject(error);
            }
        };
        
        video.onerror = (error) => {
            reject(new Error('视频加载失败'));
        };
    });
}

// 计算视频码率
function calculateBitrate(quality, width, height, frameRate = 30) {
    // 基础码率计算：分辨率 × 实际帧速率 × 质量系数
    const baseBitrate = width * height * frameRate * 0.07;
    // 根据质量滑块调整码率（0-100%）
    const qualityFactor = quality / 100;
    return Math.round(baseBitrate * qualityFactor);
}

// 显示压缩后视频
function displayCompressedVideo(blob) {
    // 创建视频URL
    const videoURL = URL.createObjectURL(blob);
    
    // 设置视频源
    compressedVideo.src = videoURL;
    compareCompressedVideo.src = videoURL;
    
    // 显示视频容器
    compressedVideoContainer.classList.remove('hidden');
    
    // 加载视频元数据
    compressedVideo.onloadedmetadata = () => {
        // 显示视频信息
        compressedInfo.classList.remove('hidden');
        compressedFileName.textContent = `compressed_${originalFile.name}`;
        compressedFileSize.textContent = formatFileSize(blob.size);
        
        // 计算压缩率
        const originalSize = originalFile.size;
        const compressedSize = blob.size;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        const savedSize = originalSize - compressedSize;
        
        compressionRatio.textContent = `${ratio}%`;
        spaceSaved.textContent = formatFileSize(savedSize);
    };
    
    // 设置下载链接
    downloadBtn.href = videoURL;
    downloadBtn.download = `compressed_${originalFile.name}`;
    downloadBtn.classList.remove('hidden');
}

// 显示对比视图
function showComparison() {
    comparisonContainer.classList.remove('hidden');
    noComparison.classList.add('hidden');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时长
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 初始化应用
initApp();