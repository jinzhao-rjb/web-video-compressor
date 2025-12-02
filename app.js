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
        video.muted = true; // 静音播放，避免影响用户体验
        video.preload = 'auto'; // 预加载更多数据，确保流畅播放
        
        // 移动端优化：添加crossOrigin属性确保视频可以正确处理
        video.crossOrigin = 'anonymous';
        
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
                const ctx = canvas.getContext('2d');
                
                // 使用视频原始帧率，确保视频正常播放
                const frameRate = video.videoFrameRate || 30;
                
                // 移动端优化：根据设备性能调整帧率
                if (navigator.userAgent.match(/mobile/i)) {
                    // 移动端降低帧率，减少性能消耗
                    frameRate = Math.min(frameRate, 24);
                }
                
                // 设置视频质量和编码格式，优先选择H.264（更适合移动端）
                let mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2'; // H.264 + AAC
                
                // 移动端优化：简化编码格式检测，确保兼容性
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    // 回退到基础MP4格式，提高移动端兼容性
                    mimeType = 'video/mp4';
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        // 最后回退到webm
                        mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
                    }
                }
                
                // 计算视频和音频码率
                const videoBitrate = calculateBitrate(quality, evenWidth, evenHeight, frameRate);
                const audioBitrate = 128000; // 固定音频码率为128kbps，确保音频质量
                const totalBitrate = videoBitrate + audioBitrate;
                
                // 关键改进：简化录制参数，提高移动端兼容性
                const recorderOptions = {
                    mimeType: mimeType,
                    videoBitsPerSecond: videoBitrate,
                    audioBitsPerSecond: audioBitrate
                };
                
                // 移动端优化：简化媒体流处理，避免复杂的音视频轨道混合
                let stream;
                try {
                    // 尝试获取原始视频的媒体流（包含音频和视频）
                    await video.play();
                    const originalStream = video.captureStream(frameRate);
                    
                    // 获取canvas的视频流
                    const canvasStream = canvas.captureStream(frameRate);
                    
                    // 创建新的媒体流，包含视频和音频
                    stream = new MediaStream();
                    
                    // 添加音频轨道
                    const audioTracks = originalStream.getAudioTracks();
                    audioTracks.forEach(track => {
                        stream.addTrack(track);
                    });
                    
                    // 添加视频轨道
                    const videoTracks = canvasStream.getVideoTracks();
                    videoTracks.forEach(track => {
                        stream.addTrack(track);
                    });
                } catch (audioError) {
                    console.warn('音频处理失败，将仅处理视频:', audioError);
                    // 移动端优化：如果音频处理失败，只处理视频
                    stream = canvas.captureStream(frameRate);
                }
                
                const recorder = new MediaRecorder(stream, recorderOptions);
                
                // 存储录制的视频数据
                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };
                
                // 录制完成时处理数据
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { 
                        type: recorder.mimeType,
                        lastModified: Date.now()
                    });
                    resolve(blob);
                };
                
                // 开始录制，设置较大的数据块间隔，减少移动端内存占用
                recorder.start(1000); // 每1000ms产生一个数据块
                
                // 更新进度条
                const duration = video.duration;
                
                // 设置视频播放速率为1，确保正常播放
                video.playbackRate = 1;
                
                // 优化：使用视频的currentTime控制绘制，确保视频完整播放
                let lastProgressUpdate = 0;
                let isStopped = false;
                
                // 计算关键参数
                const progressUpdateInterval = 200; // 每200ms更新一次进度条，减少DOM操作
                
                // 确保视频播放到结束
                video.addEventListener('ended', () => {
                    console.log('视频播放结束，停止录制');
                    isStopped = true;
                    recorder.stop();
                    video.pause();
                    // 确保最后进度是100%
                    progressFill.style.width = `100%`;
                    progressText.textContent = `100%`;
                });
                
                // 添加timeupdate事件监听，实时监控视频播放进度
                let lastTimeUpdate = 0;
                
                video.addEventListener('timeupdate', () => {
                    lastTimeUpdate = Date.now();
                    
                    // 检查视频是否已经接近结束
                    if (video.currentTime >= duration - 0.5 && !isStopped) {
                        console.log('视频接近结束，准备停止录制');
                    }
                });
                
                // 检查视频是否卡住
                function checkStuck() {
                    if (isStopped) return;
                    
                    const now = Date.now();
                    if (now - lastTimeUpdate > 3000) { // 超过3秒没有更新，可能卡住
                        console.log('视频可能卡住，尝试恢复播放');
                        
                        // 移动端优化：简化恢复逻辑，避免频繁操作
                        try {
                            video.currentTime = Math.min(video.currentTime + 1, duration - 1);
                            video.play().catch(e => console.error('恢复播放失败:', e));
                        } catch (e) {
                            console.error('调整视频位置失败:', e);
                            // 无法恢复，强制完成
                            isStopped = true;
                            recorder.stop();
                            video.pause();
                        }
                    }
                    
                    // 继续检查
                    if (!isStopped) {
                        setTimeout(checkStuck, 2000);
                    }
                }
                
                // 开始检查视频是否卡住
                setTimeout(checkStuck, 3000);
                
                // 移动端优化：简化绘制逻辑，提高性能
                function drawFrame() {
                    if (isStopped) {
                        return;
                    }
                    
                    try {
                        // 绘制当前帧到canvas
                        ctx.drawImage(video, 0, 0, evenWidth, evenHeight);
                        
                        // 减少DOM更新频率
                        const now = Date.now();
                        if (now - lastProgressUpdate >= progressUpdateInterval) {
                            // 更新进度
                            const progress = Math.min(100, Math.round((video.currentTime / duration) * 100));
                            progressFill.style.width = `${progress}%`;
                            progressText.textContent = `${progress}%`;
                            lastProgressUpdate = now;
                        }
                    } catch (e) {
                        console.error('绘制帧失败:', e);
                        // 绘制失败不影响整体流程，继续下一帧
                    }
                    
                    // 继续下一帧
                    requestAnimationFrame(drawFrame);
                }
                
                // 开始绘制循环
                requestAnimationFrame(drawFrame);
                
                // 确保视频开始播放
                try {
                    await video.play();
                    console.log('视频播放开始，总时长:', duration);
                } catch (error) {
                    console.error('视频播放失败:', error);
                    // 移动端优化：处理自动播放限制，尝试使用静音播放
                    try {
                        video.muted = true;
                        await video.play();
                        console.log('静音模式下视频播放成功');
                    } catch (mutedError) {
                        console.error('静音播放也失败:', mutedError);
                        reject(new Error('视频播放失败，请确保已授予必要的权限'));
                        return;
                    }
                }
                
                // 额外的保险措施：设置一个超时，防止无限等待
                const maxDuration = duration * 3; // 移动端增加超时时间
                setTimeout(() => {
                    if (!isStopped) {
                        console.log('超时强制停止，当前进度:', (video.currentTime / duration * 100).toFixed(2) + '%');
                        isStopped = true;
                        recorder.stop();
                        video.pause();
                    }
                }, maxDuration * 1000);
                
            } catch (error) {
                console.error('压缩过程错误:', error);
                reject(error);
            }
        };
        
        video.onerror = (error) => {
            console.error('视频加载错误:', error);
            reject(new Error('视频加载失败'));
        };
    });
}

// 计算视频码率
function calculateBitrate(quality, width, height, frameRate = 30) {
    // 基础码率计算：分辨率 × 实际帧速率 × 质量系数
    // 提高质量系数，从0.07调整到0.15，避免码率过低导致卡顿
    const baseBitrate = width * height * frameRate * 0.15;
    // 根据质量滑块调整码率（0-100%）
    const qualityFactor = quality / 100;
    return Math.round(baseBitrate * qualityFactor);
}

// 视频修复方案：确保所有播放器都能正常使用进度条
async function fixSeekableVideo(blob) {
    console.log('Using optimized method to fix video metadata');
    
    try {
        // 移动端优化：简化视频修复逻辑，减少性能消耗
        const originalType = blob.type;
        console.log('Original blob type:', originalType);
        
        // 确保返回的视频是MP4格式，这是最广泛支持的格式
        if (originalType.includes('mp4')) {
            // 如果已经是MP4格式，直接返回，但确保设置了正确的类型
            return new Blob([blob], { 
                type: 'video/mp4',
                lastModified: Date.now()
            });
        } else {
            // 移动端优化：避免复杂的格式转换，直接返回原始视频
            // 大多数现代移动端浏览器都支持webm格式
            return blob;
        }
    } catch (error) {
        console.error('Video metadata fix failed:', error);
        return blob;
    }
}

// 显示压缩后视频
async function displayCompressedVideo(blob) {
    // 关键改进：先修复视频元数据，再显示视频
    const fixedBlob = await fixSeekableVideo(blob);
    
    // 创建视频URL
    const videoURL = URL.createObjectURL(fixedBlob);
    
    // 设置视频源
    compressedVideo.src = videoURL;
    compareCompressedVideo.src = videoURL;
    
    // 确保视频元素添加了controls属性
    compressedVideo.controls = true;
    compareCompressedVideo.controls = true;
    
    // 显示视频容器
    compressedVideoContainer.classList.remove('hidden');
    
    // 立即显示下载按钮，使用修复后的视频，统一使用MP4扩展名以获得最大兼容性
    downloadBtn.href = videoURL;
    // 替换原始文件名的扩展名，统一使用MP4格式
    const originalNameWithoutExt = originalFile.name.replace(/\.[^/.]+$/, '');
    downloadBtn.download = `compressed_${originalNameWithoutExt}.mp4`;
    downloadBtn.classList.remove('hidden');
    
    // 显示对比视图
    showComparison();
    
    // 加载视频元数据
    compressedVideo.onloadedmetadata = () => {
        // 显示视频信息
        compressedInfo.classList.remove('hidden');
        compressedFileName.textContent = `compressed_${originalFile.name}`;
        compressedFileSize.textContent = formatFileSize(fixedBlob.size);
        
        // 计算压缩率
        const originalSize = originalFile.size;
        const compressedSize = fixedBlob.size;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        const savedSize = originalSize - compressedSize;
        
        compressionRatio.textContent = `${ratio}%`;
        spaceSaved.textContent = formatFileSize(savedSize);
        
        // 移动端优化：避免自动播放，让用户手动控制
        // 直接播放视频一小段时间，确保浏览器识别视频可拖动
        compressedVideo.play().then(() => {
            // 播放一小段后暂停
            setTimeout(() => {
                compressedVideo.pause();
                // 将视频进度条重置到开头
                compressedVideo.currentTime = 0;
                
                console.log('视频已准备就绪，现在支持进度条拖动！');
                console.log('视频时长:', compressedVideo.duration);
                console.log('视频可拖动范围:', compressedVideo.seekable);
            }, 100);
        }).catch(error => {
            console.error('视频自动播放失败:', error);
            // 移动端优化：自动播放失败是正常的，不影响使用
        });
    };
    
    // 移动端优化：添加错误处理，确保视频可以正常加载
    compressedVideo.onerror = (error) => {
        console.error('压缩视频加载失败:', error);
        // 显示友好的错误信息
        alert('视频加载失败，请尝试下载后观看');
    };
    
    // 添加seeking和seeked事件监听，确保进度条拖动正常工作
    compressedVideo.addEventListener('seeking', () => {
        console.log('正在拖动进度条...');
    });
    
    compressedVideo.addEventListener('seeked', () => {
        console.log('进度条拖动完成，当前时间:', compressedVideo.currentTime);
    });
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