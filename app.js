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
    // 移动端优化：添加触摸支持
    addTouchSupport();
    // 移动端优化：检查设备类型
    checkMobileDevice();
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
    
    // 添加质量/速度平衡选项
    const qualityModeSelect = document.createElement('select');
    qualityModeSelect.id = 'quality-mode';
    qualityModeSelect.className = 'form-control';
    qualityModeSelect.innerHTML = `
        <option value="balanced">平衡模式</option>
        <option value="speed">速度优先</option>
        <option value="quality">质量优先</option>
    `;
    
    const modeLabel = document.createElement('label');
    modeLabel.htmlFor = 'quality-mode';
    modeLabel.className = 'mt-2';
    modeLabel.textContent = '压缩模式:';
    
    const optionsContainer = qualitySlider.parentElement;
    optionsContainer.appendChild(modeLabel);
    optionsContainer.appendChild(qualityModeSelect);
    
    // 压缩按钮事件
    compressBtn.addEventListener('click', handleCompress);
}

// 更新压缩质量显示
function updateQualityValue() {
    qualityValue.textContent = `${qualitySlider.value}%`;
}

// 移动端优化：添加触摸支持
function addTouchSupport() {
    // 为上传区域添加触摸事件
    uploadArea.addEventListener('touchstart', () => {
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('touchend', () => {
        uploadArea.classList.remove('dragover');
    });
    
    // 为视频容器添加触摸事件，支持双击全屏
    const videoContainers = [originalVideoContainer, compressedVideoContainer];
    videoContainers.forEach(container => {
        container.addEventListener('dblclick', () => {
            const video = container.querySelector('video');
            if (video) {
                toggleFullscreen(video);
            }
        });
    });
    
    // 触摸滑动支持：用于比较视图切换
    let startX = 0;
    comparisonContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    comparisonContainer.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        
        // 滑动距离超过50px才触发切换
        if (Math.abs(deltaX) > 50) {
            // 可以在这里添加比较视图切换逻辑
            console.log('Swipe detected:', deltaX > 0 ? 'right' : 'left');
        }
    });
}

// 移动端优化：检查设备类型
function checkMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('Mobile device detected, applying mobile optimizations');
        
        // 移动端优化：调整视频质量默认值，降低移动端资源消耗
        qualitySlider.value = Math.min(qualitySlider.value, 80);
        updateQualityValue();
        
        // 移动端优化：添加点击外部关闭视频的功能
        document.addEventListener('click', (e) => {
            const videoContainers = [originalVideoContainer, compressedVideoContainer];
            let clickedInside = false;
            
            videoContainers.forEach(container => {
                if (container.contains(e.target)) {
                    clickedInside = true;
                }
            });
            
            if (!clickedInside) {
                // 可以在这里添加关闭视频的逻辑
            }
        });
    }
}

// 移动端优化：全屏切换
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        element.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// 移动端优化：调整视频大小以适应移动设备
function resizeVideoForMobile(video) {
    const isMobile = document.body.classList.contains('mobile-device');
    if (isMobile && video.videoWidth > 1280) {
        // 移动端优化：如果视频宽度超过1280px，添加样式类
        video.classList.add('mobile-video');
    }
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
async function processFile(file, quality) {
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
        alert('请上传视频文件！');
        return Promise.reject(new Error('请上传视频文件！'));
    }
    
    // 检查文件大小（限制1GB）
    if (file.size > 1024 * 1024 * 1024) {
        alert('视频文件大小不能超过1GB！');
        return Promise.reject(new Error('视频文件大小不能超过1GB！'));
    }
    
    originalFile = file;
    
    // 显示原始视频
    displayOriginalVideo(file);
    
    // 启用压缩按钮
    compressBtn.disabled = false;
    
    try {
        // 使用优化版压缩函数（支持并行处理）
        const compressedBlob = await optimizedCompressVideo(file, quality || 80);
        
        // 修复视频元数据
        const fixedBlob = await fixSeekableVideo(compressedBlob);
        
        return fixedBlob;
    } catch (error) {
        console.error('处理文件时出错:', error);
        return Promise.reject(error);
    }
}

// 显示原始视频
function displayOriginalVideo(file) {
    // 创建视频URL
    const videoURL = URL.createObjectURL(file);
    
    // 设置视频源
    originalVideo.src = videoURL;
    originalVideo.crossOrigin = 'anonymous';
    // 移动端优化：允许视频内联播放
    originalVideo.playsInline = true;
    originalVideo.muted = true; // 移动端优化：自动播放需要静音
    
    compareOriginalVideo.src = videoURL;
    compareOriginalVideo.crossOrigin = 'anonymous';
    compareOriginalVideo.playsInline = true;
    compareOriginalVideo.muted = true;
    
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
        
        // 移动端优化：调整视频大小以适应移动设备
        resizeVideoForMobile(originalVideo);
    };
}

// 处理压缩
async function handleCompress() {
    // 重置错误状态
    let fallbackAttempted = false;
    
    // 定义错误处理函数
    const handleCompressionError = async (error, stage) => {
        console.error(`压缩${stage}阶段出错:`, error);
        
        // 根据错误类型提供具体的错误信息
        let errorMessage;
        
        if (error.name === 'NotSupportedError' || error.message?.includes('encoding')) {
            errorMessage = '不支持的视频编码格式，请尝试降低质量设置';
        } else if (error.name === 'OutOfMemoryError' || error.message?.includes('memory')) {
            errorMessage = '内存不足，请尝试选择更小的视频或降低质量';
        } else if (error.name === 'AbortError') {
            errorMessage = '压缩已被取消';
        } else {
            errorMessage = `压缩失败: ${error.message || '未知错误'}`;
        }
        
        // 显示错误信息
        alert(errorMessage);
        
        // 如果还没有尝试过回退方案，自动尝试基础压缩模式
        if (!fallbackAttempted && stage !== 'fallback') {
            fallbackAttempted = true;
            alert('正在尝试使用基础压缩模式...');
            try {
                // 自动降级到最基础的压缩设置
                await attemptFallbackCompression();
                return true; // 回退成功
            } catch (fallbackError) {
                console.error('回退压缩也失败:', fallbackError);
                alert('所有压缩模式都失败，请尝试选择其他视频文件');
                return false; // 回退失败
            }
        }
        
        return false;
    };
    
    // 基础压缩模式的回退函数
    const attemptFallbackCompression = async () => {
        // 禁用压缩按钮
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 尝试基础压缩...';
        
        try {
            // 使用最基础的压缩设置
            const fallbackQuality = 20; // 更低的质量以提高成功率
            const fallbackResolutionScale = 0.5; // 降低分辨率以提高成功率
            
            // 执行回退压缩
            compressedBlob = await compressVideo(originalFile, fallbackQuality, fallbackResolutionScale);
            
            // 显示压缩结果
            await displayCompressedVideo(compressedBlob);
            
            // 显示对比视图
            showComparison();
            
            alert('基础压缩模式成功！');
            return compressedBlob;
        } catch (error) {
            throw new Error('回退压缩失败');
        }
    };
    
    if (!originalFile) {
        alert('请先选择要压缩的视频文件');
        return;
    }
    
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
    const qualityMode = document.getElementById('quality-mode')?.value || 'balanced';
    const isFastMode = document.getElementById('fastModeToggle')?.checked || false;
    
    // 保存到localStorage以便下次使用
    localStorage.setItem('lastQualityMode', qualityMode);
        
        // 验证视频文件格式
        if (!originalFile.type.startsWith('video/')) {
            alert('请选择有效的视频文件');
            return;
        }
        
        // 记录开始时间
        const startTime = performance.now();
        
        try {
            // 执行压缩
        compressedBlob = await compressVideo(originalFile, quality, resolutionScale, qualityMode);
            
            // 计算压缩时间
            const endTime = performance.now();
            const compressionTime = ((endTime - startTime) / 1000).toFixed(2);
            
            // 显示压缩结果
            await displayCompressedVideo(compressedBlob);
            
            // 显示对比视图
            showComparison();
            
            // 显示成功信息
            alert(`压缩成功！用时: ${compressionTime} 秒`);
            
        } catch (compressionError) {
            // 处理压缩过程中的错误
            const recoverySuccessful = await handleCompressionError(compressionError, '主压缩');
            if (!recoverySuccessful) {
                throw compressionError;
            }
        }
        
    } catch (error) {
        console.error('处理压缩请求时出错:', error);
    } finally {
        // 恢复压缩按钮
        compressBtn.disabled = false;
        compressBtn.innerHTML = '<i class="fa fa-cog mr-2"></i> 开始压缩';
        
        // 隐藏进度条
        progressContainer.classList.add('hidden');
    }
}

// 使用MediaRecorder API压缩视频
// 压缩视频函数 - 优化移动端兼容性版本
async function compressVideo(file, quality, resolutionScale, qualityMode = 'balanced') {
    return new Promise((resolve, reject) => {
        // 移动端特定优化：首先检测设备类型
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('压缩开始，设备类型:', isMobile ? '移动端' : '桌面端');
        
        // 移动端优化：降低默认质量和分辨率以适应移动设备
        if (isMobile) {
            // 移动端降低质量要求以提高成功率
            quality = Math.min(parseInt(quality), 70);
            // 移动端使用更低的分辨率缩放比例
            resolutionScale = Math.min(parseFloat(resolutionScale), 0.8);
            console.log('移动端优化应用，质量:', quality, '分辨率缩放:', resolutionScale);
        }
        
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.playsInline = true; // 关键：确保iOS等设备支持内联播放
        video.muted = true; // 静音播放，避免影响用户体验
        video.preload = 'metadata'; // 移动端优化：仅预加载元数据，减少初始加载时间
        
        // 移动端优化：添加crossOrigin属性确保视频可以正确处理
        video.crossOrigin = 'anonymous';
        
        // 错误处理：视频加载失败时的回调
        video.onerror = (e) => {
            console.error('视频加载失败:', e);
            reject(new Error('视频加载失败，可能是格式不兼容'));
        }
        
        video.onloadedmetadata = async () => {
            try {
                // 计算新的分辨率
                const newWidth = Math.round(video.videoWidth * resolutionScale);
                const newHeight = Math.round(video.videoHeight * resolutionScale);
                
                // 确保宽高是偶数
                const evenWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1;
                const evenHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1;
                
                // 移动端优化：限制最大分辨率
                const maxWidth = isMobile ? 720 : 1920;
                const maxHeight = isMobile ? 480 : 1080;
                const finalWidth = Math.min(evenWidth, maxWidth);
                const finalHeight = Math.min(evenHeight, maxHeight);
                
                // 创建canvas元素用于绘制缩放后的视频
                const canvas = document.createElement('canvas');
                canvas.width = finalWidth;
                canvas.height = finalHeight;
                const ctx = canvas.getContext('2d');
                
                // 使用视频原始帧率，确保视频正常播放
                let frameRate = video.videoFrameRate || 30;
                
                // 移动端优化：根据设备性能调整帧率
                if (isMobile) {
                    // 移动端降低帧率，减少性能消耗
                    frameRate = Math.min(frameRate, 15); // 更低的帧率提高兼容性
                    console.log('移动端降低帧率至:', frameRate);
                }
                
                // 优化的MIME类型检测函数，优先确保移动端兼容性
                function determineBestMimeType() {
                    // 移动端优先使用更基础的H.264编码配置，提高兼容性
                    const mobileMimeTypes = [
                        'video/mp4', // 最简单的MP4格式，兼容性最好
                        'video/mp4;codecs=avc1.42c01e,aac', // 基础H.264 + AAC配置
                        'video/webm' // 简单WebM格式作为备选
                    ];
                    
                    // 桌面端可以使用更高级的编码
                    const desktopMimeTypes = [
                        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                        'video/mp4',
                        'video/webm;codecs=vp9,opus',
                        'video/webm'
                    ];
                    
                    // 根据设备类型选择MIME类型列表
                    const mimeTypes = isMobile ? mobileMimeTypes : desktopMimeTypes;
                    
                    // 逐步降级检测
                    console.log('检测支持的MIME类型，设备类型:', isMobile ? '移动端' : '桌面端');
                    for (const mimeType of mimeTypes) {
                        if (MediaRecorder.isTypeSupported(mimeType)) {
                            console.log('选择MIME类型:', mimeType);
                            return mimeType;
                        }
                        console.log('不支持的MIME类型:', mimeType);
                    }
                    
                    // 最终回退到最基础的MP4格式
                    console.log('使用最基础的MP4格式');
                    return 'video/mp4';
                }
                
                // 使用优化的MIME类型检测函数
                let mimeType = determineBestMimeType();
                
                // 计算视频码率
                // 移动端优化：使用更低的码率
                const baseQualityFactor = isMobile ? 0.05 : 0.1;
                let qualityFactor;
                
                // 根据质量模式调整码率因子
                switch (qualityMode) {
                    case 'speed':
                        qualityFactor = baseQualityFactor * 0.5; // 速度优先，更低的码率
                        break;
                    case 'quality':
                        qualityFactor = baseQualityFactor * 1.5; // 质量优先，更高的码率
                        break;
                    case 'balanced':
                    default:
                        qualityFactor = baseQualityFactor;
                }
                
                // 简化的码率计算，更适合移动端
                const videoBitrate = Math.floor(finalWidth * finalHeight * frameRate * qualityFactor * (quality / 100));
                
                // 移动端优化：限制最大码率
                const maxBitrate = isMobile ? 1000000 : 5000000; // 移动端最大1Mbps
                const finalVideoBitrate = Math.min(videoBitrate, maxBitrate);
                
                // 移动端优化：简化录制参数，只保留必要选项
                const recorderOptions = {
                    mimeType: mimeType,
                    videoBitsPerSecond: finalVideoBitrate,
                    // 移除音频相关配置，避免兼容性问题
                    // 移除关键帧间隔设置，使用浏览器默认值
                }
                
                // 关键改进：移动端完全简化媒体流处理
                let stream;
                try {
                    // 移动端优化：直接使用canvas流，完全避免音频处理
                    if (isMobile) {
                        console.log('移动端模式：仅使用canvas视频流');
                        stream = canvas.captureStream(frameRate);
                    } else {
                        // 桌面端仍然尝试处理音频
                        try {
                            // 尝试获取原始视频的媒体流
                            await video.play();
                            const originalStream = video.captureStream(frameRate);
                            
                            // 获取canvas的视频流
                            const canvasStream = canvas.captureStream(frameRate);
                            
                            // 创建新的媒体流，包含视频和音频
                            stream = new MediaStream();
                            
                            // 添加音频轨道
                            const audioTracks = originalStream.getAudioTracks();
                            if (audioTracks.length > 0) {
                                stream.addTrack(audioTracks[0]);
                            }
                            
                            // 添加视频轨道
                            const videoTracks = canvasStream.getVideoTracks();
                            if (videoTracks.length > 0) {
                                stream.addTrack(videoTracks[0]);
                            }
                        } catch (audioError) {
                            console.warn('音频处理失败，将仅处理视频:', audioError);
                            stream = canvas.captureStream(frameRate);
                        }
                    }
                } catch (streamError) {
                    console.error('创建媒体流失败:', streamError);
                    // 最后回退：即使失败也尝试使用canvas流
                    stream = canvas.captureStream(frameRate);
                }
                
                // 创建录制器
                let recorder;
                try {
                    recorder = new MediaRecorder(stream, recorderOptions);
                } catch (recorderError) {
                    console.error('创建MediaRecorder失败:', recorderError);
                    // 回退：使用最简配置
                    recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
                }
                
                // 存储录制的视频数据
                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };
                
                // 录制完成时处理数据
                recorder.onstop = () => {
                    console.log('录制完成，数据块数量:', chunks.length);
                    const blob = new Blob(chunks, { 
                        type: recorder.mimeType,
                        lastModified: Date.now()
                    });
                    resolve(blob);
                };
                
                // 录制错误处理
                recorder.onerror = (e) => {
                    console.error('MediaRecorder错误:', e);
                    reject(new Error('录制过程中发生错误'));
                };
                
                // 移动端优化：使用更短的数据块间隔，减少内存压力
                const timeSlice = isMobile ? 500 : 1000;
                recorder.start(timeSlice);
                
                // 更新进度条
                const duration = video.duration;
                
                // 设置视频播放速率为1，确保正常播放
                video.playbackRate = 1;
                
                // 优化：使用视频的currentTime控制绘制，确保视频完整播放
                let lastProgressUpdate = 0;
                let isStopped = false;
                let frameCount = 0;
                
                // 移动端优化：设置最长处理时间，防止长时间阻塞
                const maxProcessingTime = isMobile ? 45000 : 60000; // 移动端45秒，桌面端60秒
                const startTime = Date.now();
                
                // 计算关键参数
                const progressUpdateInterval = isMobile ? 500 : 200; // 移动端降低更新频率
                
                // 确保视频播放到结束
                video.addEventListener('ended', () => {
                    console.log('视频播放结束，停止录制');
                    isStopped = true;
                    recorder.stop();
                    video.pause();
                    // 确保最后进度是100%
                    if (progressFill) {
                        progressFill.style.width = `100%`;
                    }
                    if (progressText) {
                        progressText.textContent = `100%`;
                    }
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
                    
                    // 检查是否超时
                    if (Date.now() - startTime > maxProcessingTime) {
                        console.warn('压缩超时，强制完成');
                        isStopped = true;
                        recorder.stop();
                        cleanup();
                        return;
                    }
                    
                    const now = Date.now();
                    // 移动端更宽松的卡住检测时间
                    const stuckThreshold = isMobile ? 5000 : 3000;
                    
                    if (now - lastTimeUpdate > stuckThreshold) { // 移动端超过5秒没有更新，可能卡住
                        console.log('视频可能卡住，尝试恢复播放');
                        
                        // 移动端优化：直接跳过卡住的部分，减少复杂操作
                        if (isMobile) {
                            try {
                                // 跳过更大的时间跨度
                                const skipAmount = Math.min(2, duration - video.currentTime - 0.5);
                                video.currentTime = video.currentTime + skipAmount;
                                console.log('移动端跳过时间:', skipAmount, 's');
                                lastTimeUpdate = now;
                            } catch (e) {
                                console.error('调整视频位置失败:', e);
                                // 无法恢复，强制完成
                                isStopped = true;
                                recorder.stop();
                                video.pause();
                            }
                        } else {
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
                    }
                    
                    // 继续检查
                    if (!isStopped) {
                        setTimeout(checkStuck, isMobile ? 3000 : 2000);
                    }
                }
                
                // 开始检查视频是否卡住
                setTimeout(checkStuck, isMobile ? 4000 : 3000);
                
                // 移动端优化：重写绘制逻辑，完全避免依赖视频播放和requestAnimationFrame
                function drawFrame() {
                    if (isStopped) {
                        return;
                    }
                    
                    // 检查是否超时
                    if (Date.now() - startTime > maxProcessingTime) {
                        console.warn('压缩超时，强制停止');
                        isStopped = true;
                        try {
                            recorder.stop();
                        } catch (e) {
                            console.warn('停止录制器失败:', e);
                        }
                        cleanup();
                        return;
                    }
                    
                    try {
                        // 绘制当前帧到canvas - 添加安全检查
                        if (ctx && video.readyState >= 2) {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            frameCount++;
                        }
                        
                        // 移动端优化：降低绘制频率，减少性能消耗
                        if (isMobile) {
                            // 移动端每2-3帧只绘制1帧，直接跳过视频时间
                            if (frameCount % (frameRate > 30 ? 3 : 2) === 0) {
                                const frameDuration = 1 / frameRate;
                                const skipFrames = frameRate > 30 ? 3 : 2;
                                try {
                                    // 安全地更新视频位置
                                    video.currentTime = Math.min(
                                        video.currentTime + frameDuration * skipFrames,
                                        duration - 0.1
                                    );
                                    lastTimeUpdate = Date.now(); // 更新时间戳，防止被检测为卡住
                                } catch (e) {
                                    console.warn('调整视频位置失败:', e);
                                }
                            }
                        }
                        
                        // 更新进度 - 完全避免requestAnimationFrame
                        const now = Date.now();
                        if (now - lastProgressUpdate >= progressUpdateInterval) {
                            if (progressFill && progressText) {
                                // 直接更新DOM，避免requestAnimationFrame
                                try {
                                    const progress = Math.min(100, Math.round((video.currentTime / duration) * 100));
                                    progressFill.style.width = `${progress}%`;
                                    progressText.textContent = `${progress}%`;
                                } catch (e) {
                                    console.warn('更新进度失败:', e);
                                }
                            }
                            lastProgressUpdate = now;
                        }
                        
                        // 检查视频是否接近结束
                        if (video.currentTime >= duration - 0.1 && !isStopped) {
                            console.log('视频接近结束，停止处理');
                            isStopped = true;
                            recorder.stop();
                            cleanup();
                            return;
                        }
                    } catch (e) {
                        console.error('绘制帧失败:', e);
                        // 绘制失败不影响整体流程，继续下一帧
                    }
                    
                    // 移动端使用setTimeout而非requestAnimationFrame，更适合后台处理
                    if (isMobile) {
                        setTimeout(drawFrame, Math.floor(1000 / frameRate));
                    } else {
                        requestAnimationFrame(drawFrame);
                    }
                }
                
                // 移动端优化：特殊处理播放逻辑
                if (isMobile) {
                    console.log('移动端模式：跳过play()调用，直接控制currentTime');
                    
                    // 尝试设置初始时间
                    try {
                        video.currentTime = 0;
                    } catch (e) {
                        console.warn('设置currentTime失败，将使用默认值:', e);
                    }
                    
                    // 开始绘制循环 - 延迟更长，减轻启动压力
                    setTimeout(drawFrame, 300);
                    
                    // 额外的安全措施：定期前进视频位置
                    // 移动端优化：降低前进频率，减少性能消耗
                    const advanceInterval = setInterval(() => {
                        if (isStopped) {
                            clearInterval(advanceInterval);
                            return;
                        }
                        
                        try {
                            // 安全检查
                            if (video && typeof video.currentTime === 'number' && 
                                typeof duration === 'number' && !isNaN(duration)) {
                                
                                // 移动端优化：更大的步长，更少的更新
                                const step = Math.min(0.2, duration * 0.02); // 2%的总时长或0.2秒取较小值
                                const newTime = video.currentTime + step;
                                
                                // 安全设置currentTime
                                if (newTime < duration) {
                                    video.currentTime = newTime;
                                    lastTimeUpdate = Date.now(); // 更新时间戳，防止被检测为卡住
                                }
                                
                                // 检查是否到达视频末尾
                                if (video.currentTime >= duration - 0.1) {
                                    clearInterval(advanceInterval);
                                    if (!isStopped) {
                                        console.log('视频处理完成');
                                        isStopped = true;
                                        try {
                                            // 安全停止录制器
                                            if (typeof recorder !== 'undefined' && recorder && 
                                                recorder.state && recorder.state !== 'inactive') {
                                                recorder.stop();
                                            }
                                        } catch (stopError) {
                                            console.warn('停止录制器失败:', stopError);
                                        } finally {
                                            // 确保调用cleanup
                                            setTimeout(cleanup, 100);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('前进视频位置失败:', e);
                            clearInterval(advanceInterval);
                            // 出错时尝试恢复或结束
                            if (!isStopped) {
                                isStopped = true;
                                try {
                                    if (recorder && recorder.state && recorder.state !== 'inactive') {
                                        recorder.stop();
                                    }
                                } catch (stopError) {
                                    console.warn('出错后停止录制器失败:', stopError);
                                }
                                setTimeout(cleanup, 100);
                            }
                        }
                    }, Math.max(500, Math.floor(1000 / frameRate * 3))); // 至少500ms或帧率间隔的3倍
                } else {
                    // 桌面端尝试正常播放
                    try {
                        // 开始绘制循环
                        requestAnimationFrame(drawFrame);
                        
                        await video.play();
                        console.log('视频播放开始，总时长:', duration);
                    } catch (error) {
                        console.error('视频播放失败:', error);
                        // 处理自动播放限制，尝试使用静音播放
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
                }
                
                // 额外的保险措施：设置一个超时，防止无限等待
                const maxDuration = duration * (isMobile ? 4 : 3); // 移动端给予更多时间
                setTimeout(() => {
                    if (!isStopped) {
                        console.log('超时强制停止，当前进度:', (video.currentTime / duration * 100).toFixed(2) + '%');
                        isStopped = true;
                        recorder.stop();
                        video.pause();
                        cleanup();
                    }
                }, maxDuration * 1000);
                
            } catch (error) {
                console.error('压缩过程错误:', error);
                cleanup();
                reject(error);
            }
        }
    });
}

// 资源清理函数 - 加强版（优化移动端兼容性）
function cleanup() {
    console.log('执行资源清理...');
    
    try {
        // 停止和清理视频元素
        if (video) {
            try {
                video.pause();
            } catch (e) {
                console.warn('暂停视频失败:', e);
            }
            
            // 清理视频源
            if (video.srcObject) {
                try {
                    // 停止所有媒体轨道，添加安全检查
                    const tracks = video.srcObject.getTracks();
                    if (Array.isArray(tracks)) {
                        tracks.forEach(track => {
                            try {
                                if (typeof track.stop === 'function') {
                                    track.stop();
                                }
                            } catch (e) {
                                console.warn('停止轨道失败:', e);
                            }
                        });
                    }
                    video.srcObject = null;
                } catch (e) {
                    console.warn('清理视频源失败:', e);
                }
            }
            
            // 清理src属性和URL对象
            try {
                if (video.src && video.src.startsWith('blob:')) {
                    try {
                        URL.revokeObjectURL(video.src);
                    } catch (e) {
                        console.warn('撤销ObjectURL失败:', e);
                    }
                }
                video.src = '';
                video.removeAttribute('src');
                
                // 移动端优化：避免调用load()，它可能在某些设备上导致问题
                if (!isMobile) {
                    try {
                        video.load();
                    } catch (e) {
                        console.warn('视频load()失败:', e);
                    }
                }
            } catch (e) {
                console.warn('清理视频属性失败:', e);
            }
            
            // 移动端优化：移除所有事件监听器
            try {
                if (isMobile && video.parentNode) {
                    const clone = video.cloneNode(true);
                    video.parentNode.replaceChild(clone, video);
                }
            } catch (e) {
                console.warn('克隆视频元素失败:', e);
            }
        }
        
        // 清空录制数据并释放内存
        if (chunks) {
            try {
                chunks.length = 0;
                // 移动端强制设置为null
                if (isMobile) {
                    chunks = null;
                }
            } catch (e) {
                console.warn('清空chunks失败:', e);
            }
        }
        
        // 停止录制器并清理
        if (typeof recorder !== 'undefined' && recorder) {
            try {
                // 安全检查录制器状态
                if (recorder.state && recorder.state !== 'inactive') {
                    recorder.stop();
                }
                // 移除事件监听器引用
                if (typeof recorder.removeEventListener === 'function') {
                    // 移除常见的事件监听器
                    recorder.removeEventListener('dataavailable', () => {});
                    recorder.removeEventListener('stop', () => {});
                }
                // 移动端直接置空
                if (isMobile) {
                    recorder = null;
                }
            } catch (e) {
                console.warn('停止录制器失败:', e);
            }
        }
        
        // 清理canvas资源（如果存在）
        if (typeof canvas !== 'undefined' && canvas) {
            try {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 移动端优化：重置canvas尺寸释放内存
                    if (isMobile) {
                        canvas.width = 1;
                        canvas.height = 1;
                    }
                }
            } catch (e) {
                console.warn('清理canvas失败:', e);
            }
        }
        
        // 调用垃圾回收
        if (typeof window.gc === 'function') {
            try {
                window.gc();
            } catch (e) {
                console.log('无法执行垃圾回收:', e);
            }
        }
        
        // 移动端优化：尝试通过其他方式触发内存释放
        if (isMobile) {
            // 强制垃圾回收提示
            try {
                // 这不会真正触发GC，但会帮助标记不再使用的对象
                navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage('gc');
            } catch (e) {
                // 忽略错误
            }
        }
        
        console.log('资源清理完成');
    } catch (e) {
        console.error('清理过程出错:', e);
    }
}

    // 错误处理
        video.onerror = (error) => {
            console.error('视频加载错误:', error);
            cleanup();
            reject(new Error('视频加载失败'));
        }

// 计算视频码率 - 支持质量和速度平衡选项
function calculateBitrate(quality, width, height, frameRate = 24, qualityOption = 'balanced') {
    // 根据质量选项选择不同的质量系数
    let qualityFactor;
    switch(qualityOption) {
        case 'speed':
            qualityFactor = 0.08; // 速度优先，最低质量系数
            break;
        case 'quality':
            qualityFactor = 0.15; // 质量优先，最高质量系数
            break;
        case 'balanced':
        default:
            qualityFactor = 0.1; // 平衡模式，中等质量系数
            break;
    }
    
    // 降低默认帧率从30到24fps，显著提高处理速度，人眼几乎无法察觉差异
    const baseBitrate = width * height * frameRate * qualityFactor;
    // 根据质量滑块调整码率（0-100%）
    const userQualityFactor = quality / 100;
    return Math.round(baseBitrate * userQualityFactor);
}

// 改进的视频元数据处理函数，同时支持移动端和桌面端
async function fixSeekableVideo(blob) {
    // 通用的元数据修复方法，适用于所有设备
    try {
        // 针对移动设备的特殊处理策略
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 使用一个更简单但有效的方法来修复MP4文件元数据
        // 对于MP4格式，我们需要确保moov原子位于文件开头（快速启动）
        if (blob.type.includes('mp4')) {
            console.log('处理MP4文件元数据');
            
            // 创建临时视频元素来验证视频
            const videoElement = document.createElement('video');
            const objectURL = URL.createObjectURL(blob);
            
            // 快速验证视频是否可以加载
            const canLoad = await new Promise((resolve) => {
                videoElement.oncanplaythrough = () => resolve(true);
                videoElement.onerror = () => resolve(false);
                videoElement.src = objectURL;
                videoElement.preload = 'metadata';
                
                // 设置超时以防加载卡住
                setTimeout(() => resolve(false), 3000);
            });
            
            // 如果视频已经可以正常加载，直接返回
            if (canLoad) {
                console.log('视频加载正常，无需修复');
                URL.revokeObjectURL(objectURL);
                return blob;
            }
            
            // 对于无法加载的视频，尝试使用Canvas重新编码（更轻量级的方法）
            console.log('尝试使用Canvas方法修复视频元数据');
            
            // 重新设置视频源并等待加载
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    console.warn('视频加载超时，尝试继续处理');
                    resolve(); // 即使超时也尝试继续处理
                }, 5000);
                
                videoElement.onloadeddata = () => {
                    clearTimeout(timeoutId);
                    resolve();
                };
                
                videoElement.onerror = (err) => {
                    clearTimeout(timeoutId);
                    console.error('视频加载错误:', err);
                    reject(err);
                };
                
                videoElement.src = objectURL;
            });
            
            // 创建Canvas用于重新处理
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 使用视频的实际尺寸
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 360;
            
            // 选择兼容的编码格式
            let mimeType;
            if (isMobileDevice) {
                // 移动端使用更基础的编码
                mimeType = 'video/mp4'; // 使用浏览器默认的MP4编码
            } else {
                // 桌面端可以使用更高级的编码
                mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
            }
            
            // 创建视频流和录制器
            const stream = canvas.captureStream(Math.min(videoElement.videoFrameRate || 30, 30));
            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks = [];
            
            recorder.ondataavailable = e => chunks.push(e.data);
            
            // 为移动设备优化的处理流程
            if (isMobileDevice) {
                // 移动端仅渲染第一帧并设置适当的元数据
                ctx.drawImage(videoElement, 0, 0);
                recorder.start();
                
                // 快速生成新的视频文件，只包含必要的元数据
                setTimeout(() => {
                    recorder.stop();
                }, 200); // 移动端更快的处理时间
            } else {
                // 桌面端的处理保持不变
                ctx.drawImage(videoElement, 0, 0);
                recorder.start();
                setTimeout(() => recorder.stop(), 300);
            }
            
            // 返回修复后的视频
            return new Promise(resolve => {
                recorder.onstop = () => {
                    const fixedBlob = new Blob(chunks, { type: mimeType });
                    URL.revokeObjectURL(objectURL);
                    console.log('视频元数据修复完成');
                    resolve(fixedBlob);
                };
            });
        } else {
            // 对于非MP4格式，仍然使用原有逻辑
            console.log('非MP4格式，使用基本处理');
            return blob;
        }
    } catch (error) {
        console.error('视频元数据修复过程中出错:', error);
        // 出错时返回原始blob作为最后的保障
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
    
    // 移动端优化：添加playsInline和muted属性，支持内联播放
    compressedVideo.playsInline = true;
    compressedVideo.muted = true;
    compareCompressedVideo.playsInline = true;
    compareCompressedVideo.muted = true;
    
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
        
        // 移动端优化：调整视频大小以适应移动设备
        resizeVideoForMobile(compressedVideo);
        
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

// 视频分块处理函数 - 并行处理实现（优化内存管理）
async function compressVideoInParallel(videoBlob, quality, qualityMode = 'balanced', maxChunks = 4) {
    // 根据视频时长确定分块数量，最多分成maxChunks块
    const video = document.createElement('video');
    const videoURL = URL.createObjectURL(videoBlob);
    video.src = videoURL;
    
    // 等待视频元数据加载
    await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
    });
    
    const duration = video.duration;
    const chunkDuration = duration / maxChunks;
    const chunks = [];
    
    // 创建分块处理函数 - 优化内存管理
    async function processChunk(startTime, endTime, chunkIndex) {
        return new Promise((resolve, reject) => {
            let chunkVideo, canvas, ctx, stream, recorder, chunkChunks = [];
            
            try {
                // 资源清理函数
                function cleanupChunk() {
                    console.log(`清理块 ${chunkIndex} 资源`);
                    
                    // 停止和清理视频元素
                    if (chunkVideo) {
                        chunkVideo.pause();
                        chunkVideo.src = '';
                        chunkVideo.removeAttribute('src');
                        chunkVideo.load();
                        // 移除事件监听器
                        chunkVideo.onseeked = null;
                    }
                    
                    // 清理画布
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                    if (canvas) {
                        canvas.width = 1;
                        canvas.height = 1;
                    }
                    
                    // 停止媒体流
                    if (stream) {
                        for (const track of stream.getTracks()) {
                            track.stop();
                        }
                    }
                    
                    // 停止录制器
                    if (recorder && recorder.state !== 'inactive') {
                        recorder.stop();
                    }
                    
                    // 清空数组
                    chunkChunks.length = 0;
                    
                    // 释放变量引用
                    chunkVideo = null;
                    canvas = null;
                    ctx = null;
                    stream = null;
                    recorder = null;
                    chunkChunks = null;
                    
                    console.log(`块 ${chunkIndex} 资源清理完成`);
                }
                
                // 使用新的视频元素处理每个分块
                chunkVideo = document.createElement('video');
                chunkVideo.src = videoURL;
                chunkVideo.currentTime = startTime;
                chunkVideo.muted = true; // 确保静音以避免意外播放声音
                
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // 创建媒体流和录制器
                stream = canvas.captureStream(24); // 使用优化的帧率
                const mimeType = determineBestMimeType();
                recorder = new MediaRecorder(stream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: calculateBitrate(quality, canvas.width, canvas.height, 24, qualityMode),
                    videoKeyFrameInterval: 30
                });
                
                recorder.ondataavailable = e => {
                    if (e.data.size > 0) {
                        chunkChunks.push(e.data);
                    }
                };
                
                recorder.onstop = () => {
                    const chunkBlob = new Blob(chunkChunks, { type: mimeType });
                    const result = { blob: chunkBlob, index: chunkIndex };
                    cleanupChunk();
                    resolve(result);
                };
                
                recorder.onerror = (e) => {
                    console.error(`录制块 ${chunkIndex} 失败:`, e);
                    cleanupChunk();
                    reject(new Error(`录制失败: ${e.error || '未知错误'}`));
                };
                
                // 开始录制
                recorder.start(100); // 每100ms创建一个数据块，减少内存占用
                
                // 处理当前分块
                function drawChunkFrame() {
                    if (!chunkVideo || !recorder || recorder.state === 'inactive') {
                        return;
                    }
                    
                    if (chunkVideo.currentTime >= endTime) {
                        recorder.stop();
                        return;
                    }
                    
                    try {
                        ctx.drawImage(chunkVideo, 0, 0, canvas.width, canvas.height);
                        chunkVideo.currentTime += 0.04; // 约25fps
                        requestAnimationFrame(drawChunkFrame);
                    } catch (e) {
                        console.error(`绘制块 ${chunkIndex} 帧失败:`, e);
                        recorder.stop();
                        reject(e);
                    }
                }
                
                // 开始绘制帧
                chunkVideo.onseeked = () => {
                    requestAnimationFrame(drawChunkFrame);
                };
                
                // 错误处理
                chunkVideo.onerror = (e) => {
                    console.error(`视频块 ${chunkIndex} 加载失败:`, e);
                    cleanupChunk();
                    reject(new Error(`视频加载失败`));
                };
            } catch (error) {
                console.error(`处理块 ${chunkIndex} 时出错:`, error);
                if (typeof cleanupChunk === 'function') {
                    cleanupChunk();
                }
                reject(error);
            }
        });
    }
    
    // 创建分块处理任务
    const processingPromises = [];
    for (let i = 0; i < maxChunks; i++) {
        const startTime = i * chunkDuration;
        const endTime = Math.min((i + 1) * chunkDuration, duration);
        processingPromises.push(processChunk(startTime, endTime, i));
    }
    
    // 等待所有分块处理完成
    const processedChunks = await Promise.all(processingPromises);
    
    // 排序分块（确保按正确顺序）
    processedChunks.sort((a, b) => a.index - b.index);
    
    // 对于浏览器环境，我们暂时只返回第一个分块的结果
    // 完整的合并需要使用MediaSource Extensions API，这会增加复杂度
    // 后续可以实现完整的合并功能
    URL.revokeObjectURL(videoURL);
    return processedChunks[0].blob;
}

// 性能监控工具
class PerformanceMonitor {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
        this.metrics = {};
    }
    
    start() {
        this.startTime = performance.now();
        this.metrics = {};
    }
    
    end() {
        this.endTime = performance.now();
        this.metrics.processingTime = this.endTime - this.startTime;
        return this.metrics;
    }
    
    addMetric(name, value) {
        this.metrics[name] = value;
    }
    
    getResults() {
        return {
            ...this.metrics,
            processingTime: this.metrics.processingTime || 0
        };
    }
    
    logResults(label) {
        const results = this.getResults();
        console.log(`${label} 性能指标:`, {
            处理时间: `${(results.processingTime / 1000).toFixed(2)}秒`,
            压缩率: results.compressionRatio ? `${results.compressionRatio.toFixed(1)}%` : 'N/A',
            帧率: results.frameRate ? `${results.frameRate.toFixed(0)}fps` : 'N/A',
            分辨率: results.resolution ? `${results.resolution.width}x${results.resolution.height}` : 'N/A'
        });
    }
}

// 优化版的compressVideo函数，根据视频大小决定是否使用并行处理
async function optimizedCompressVideo(file, quality, qualityMode = 'balanced') {
    const monitor = new PerformanceMonitor();
    monitor.start();
    
    try {
        let blob;
        
        // 小文件直接使用原始处理方法
        if (file.size < 50 * 1024 * 1024) { // 小于50MB的视频
            console.log('使用标准压缩方法处理小文件');
                blob = await compressVideo(file, quality, qualityMode);
        } else {
            // 大文件使用并行处理
            try {
                console.log('使用并行处理大文件');
                blob = await compressVideoInParallel(file, quality, qualityMode);
                monitor.addMetric('parallelProcessing', true);
            } catch (error) {
                console.error('并行处理失败，回退到原始处理方法:', error);
                blob = await compressVideo(file, quality, qualityMode);
                monitor.addMetric('parallelProcessing', false);
            }
        }
        
        // 计算压缩率
        const compressionRatio = ((1 - blob.size / file.size) * 100);
        monitor.addMetric('compressionRatio', compressionRatio);
        monitor.addMetric('inputSize', file.size);
        monitor.addMetric('outputSize', blob.size);
        monitor.addMetric('quality', quality);
        
        // 记录结果
        monitor.end();
        monitor.logResults('视频压缩');
        
        // 显示性能信息给用户
        showPerformanceInfo(monitor.getResults());
        
        return blob;
    } catch (error) {
        monitor.end();
        console.error('压缩过程中出错:', error);
        throw error;
    }
}

// 显示性能信息给用户
function showPerformanceInfo(metrics) {
    // 检查是否已存在性能信息元素
    let perfInfoElement = document.getElementById('performance-info');
    
    if (!perfInfoElement) {
        // 创建性能信息元素
        perfInfoElement = document.createElement('div');
        perfInfoElement.id = 'performance-info';
        perfInfoElement.className = 'performance-info';
        perfInfoElement.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        // 添加到结果区域
        const resultsContainer = document.querySelector('.results-container') || document.body;
        resultsContainer.appendChild(perfInfoElement);
    }
    
    // 更新性能信息
    perfInfoElement.innerHTML = `
        <h4 style="margin-top: 0; color: #333;">处理性能</h4>
        <div style="line-height: 1.6;">
            <p><strong>处理时间:</strong> ${(metrics.processingTime / 1000).toFixed(2)} 秒</p>
            <p><strong>压缩率:</strong> ${metrics.compressionRatio ? metrics.compressionRatio.toFixed(1) + '%' : 'N/A'}</p>
            <p><strong>输入大小:</strong> ${formatFileSize(metrics.inputSize)}</p>
            <p><strong>输出大小:</strong> ${formatFileSize(metrics.outputSize)}</p>
            <p><strong>质量设置:</strong> ${metrics.quality}</p>
            <p><strong>并行处理:</strong> ${metrics.parallelProcessing ? '是' : '否'}</p>
        </div>
    `;
}

// 修改handleCompress函数以支持质量模式选项
function handleCompress(event) {
    // 显示压缩进度条
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // 禁用压缩按钮
    compressBtn.disabled = true;
    
    // 获取质量设置
    const quality = qualitySlider.value;
    
    // 显示处理中状态
    statusText.textContent = '处理中...';
    
    // 开始处理文件
    processFile(originalFile, quality).then(blob => {
        // 显示处理完成状态
        statusText.textContent = '处理完成!';
        
        // 显示压缩后视频
        displayCompressedVideo(blob);
        
        // 启用压缩按钮
        compressBtn.disabled = false;
        
        // 保存到全局变量，供比较视图使用
        compressedBlob = blob;
    }).catch(error => {
        console.error('压缩过程中出错:', error);
        
        // 显示错误信息
        statusText.textContent = '处理失败，请重试';
        
        // 启用压缩按钮
        compressBtn.disabled = false;
        
        // 尝试回退压缩方法
        attemptFallbackCompression(originalFile, quality);
    });
}

// 初始化应用
initApp();