document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const fileCount = document.getElementById('fileCount');
    const uploadButton = document.getElementById('uploadButton');
    const uploadArea = document.getElementById('uploadArea');
    const imageGallery = document.getElementById('imageGallery');
    const imageCount = document.getElementById('imageCount');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const downloadModal = document.getElementById('downloadModal');
    const uniformNaming = document.getElementById('uniformNaming');
    const uniformNameGroup = document.querySelector('.uniform-name-group');
    const baseFileName = document.getElementById('baseFileName');
    const cancelDownload = document.getElementById('cancelDownload');
    const confirmDownload = document.getElementById('confirmDownload');
    
    // State
    const MAX_IMAGES = 50;
    let uploadedImages = [];
    
    // Event Listeners
    fileInput.addEventListener('change', handleFileSelection);
    uploadButton.addEventListener('click', handleUpload);
    downloadAllButton.addEventListener('click', showDownloadModal);
    uniformNaming.addEventListener('change', toggleUniformNaming);
    cancelDownload.addEventListener('click', hideDownloadModal);
    confirmDownload.addEventListener('click', downloadImages);
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Handle file selection
    function handleFileSelection() {
        const files = Array.from(fileInput.files).filter(file => file.type.startsWith('image/'));
        
        if (files.length > MAX_IMAGES) {
            showNotification(`一次最多只能上传 ${MAX_IMAGES} 张图片。`, 'error');
            fileInput.value = '';
            fileCount.textContent = '0';
            return;
        }
        
        fileCount.textContent = files.length;
        uploadButton.disabled = files.length === 0;
        
        if (files.length > 0) {
            uploadArea.classList.add('has-files');
        } else {
            uploadArea.classList.remove('has-files');
        }
    }
    
    // Handle image upload
    function handleUpload() {
        const files = Array.from(fileInput.files).filter(file => file.type.startsWith('image/'));
        
        if (files.length === 0) {
            return;
        }
        
        if (uploadedImages.length + files.length > MAX_IMAGES) {
            showNotification(`最多只能有 ${MAX_IMAGES} 张图片。请先删除一些图片。`, 'error');
            return;
        }
        
        // Show loading state
        uploadButton.disabled = true;
        uploadButton.textContent = '上传中...';
        
        let processed = 0;
        
        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = {
                    id: generateUniqueId(),
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                    annotation: ''
                };
                
                uploadedImages.push(imageData);
                addImageToGallery(imageData);
                
                processed++;
                
                if (processed === files.length) {
                    // Reset upload state
                    uploadButton.textContent = '上传图片';
                    uploadButton.disabled = true;
                    uploadArea.classList.remove('has-files');
                    
                    // Show success message
                    showNotification(`成功上传 ${files.length} 张图片。`, 'success');
                    
                    updateImageCount();
                }
            };
            
            reader.onerror = function() {
                processed++;
                showNotification(`读取文件失败: ${file.name}`, 'error');
                
                if (processed === files.length) {
                    uploadButton.textContent = '上传图片';
                    uploadButton.disabled = false;
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Reset file input
        fileInput.value = '';
        fileCount.textContent = '0';
    }
    
    // Add image to gallery
    function addImageToGallery(imageData) {
        const template = document.getElementById('imageCardTemplate');
        const imageCard = document.importNode(template.content, true);
        
        const card = imageCard.querySelector('.image-card');
        card.dataset.id = imageData.id;
        
        const img = imageCard.querySelector('img');
        img.src = imageData.data;
        img.alt = imageData.name;
        
        // Add loading animation
        img.style.opacity = '0';
        img.onload = function() {
            img.style.opacity = '1';
        };
        
        const textarea = imageCard.querySelector('.image-annotation');
        textarea.value = imageData.annotation;
        textarea.addEventListener('input', (e) => {
            const id = e.target.closest('.image-card').dataset.id;
            const image = uploadedImages.find(img => img.id === id);
            if (image) {
                image.annotation = e.target.value;
            }
        });
        
        const deleteButton = imageCard.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            deleteImage(imageData.id);
        });
        
        // Add with animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        imageGallery.appendChild(imageCard);
        
        // Trigger reflow
        card.offsetHeight;
        
        // Apply animation
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }
    
    // Delete image
    function deleteImage(id) {
        const index = uploadedImages.findIndex(img => img.id === id);
        if (index !== -1) {
            const imageCard = document.querySelector(`.image-card[data-id="${id}"]`);
            
            if (imageCard) {
                // Animate removal
                imageCard.style.opacity = '0';
                imageCard.style.transform = 'scale(0.9)';
                
                setTimeout(() => {
                    imageCard.remove();
                    uploadedImages.splice(index, 1);
                    updateImageCount();
                    showNotification('图片已删除。', 'info');
                }, 300);
            } else {
                uploadedImages.splice(index, 1);
                updateImageCount();
            }
        }
    }
    
    // Update image count
    function updateImageCount() {
        const count = uploadedImages.length;
        imageCount.textContent = `${count} 张图片`;
        downloadAllButton.disabled = count === 0;
    }
    
    // Show download modal
    function showDownloadModal() {
        if (uploadedImages.length === 0) {
            return;
        }
        
        downloadModal.classList.add('active');
    }
    
    // Hide download modal
    function hideDownloadModal() {
        downloadModal.classList.remove('active');
    }
    
    // Toggle uniform naming options
    function toggleUniformNaming() {
        if (uniformNaming.checked) {
            uniformNameGroup.classList.remove('hidden');
        } else {
            uniformNameGroup.classList.add('hidden');
        }
    }
    
    // Download images as ZIP
    async function downloadImages() {
        if (uploadedImages.length === 0) {
            return;
        }
        
        // Show loading state
        confirmDownload.textContent = '准备中...';
        confirmDownload.disabled = true;
        
        try {
            const zip = new JSZip();
            const useUniformNaming = uniformNaming.checked;
            const baseName = baseFileName.value || '图片';
            
            uploadedImages.forEach((image, index) => {
                // Get file extension from original name
                const extension = image.name.split('.').pop();
                
                // Create filename based on user preference
                let filename;
                if (useUniformNaming) {
                    filename = `${baseName}_${(index + 1).toString().padStart(3, '0')}.${extension}`;
                } else {
                    filename = image.name;
                }
                
                // Add image to zip
                const imageData = image.data.split(',')[1]; // Remove the data URL prefix
                zip.file(filename, imageData, {base64: true});
                
                // Add annotation if it exists
                if (image.annotation && image.annotation.trim()) {
                    const annotationFilename = filename.replace(`.${extension}`, '.txt');
                    zip.file(annotationFilename, image.annotation);
                }
            });
            
            // Generate and download the zip file
            const content = await zip.generateAsync({type: 'blob'});
            saveAs(content, '图片.zip');
            
            // Show success message
            showNotification('图片下载成功！', 'success');
            
            // Hide modal
            hideDownloadModal();
        } catch (error) {
            showNotification('创建ZIP文件时出错。请重试。', 'error');
            console.error('创建ZIP出错:', error);
        } finally {
            // Reset button state
            confirmDownload.textContent = '下载';
            confirmDownload.disabled = false;
        }
    }
    
    // Setup drag and drop functionality
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            uploadArea.classList.add('highlight');
        }
        
        function unhighlight() {
            uploadArea.classList.remove('highlight');
        }
        
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelection();
            }
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Check if notification container exists, if not create it
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        notification.appendChild(closeButton);
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('hiding');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Generate unique ID
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}); 