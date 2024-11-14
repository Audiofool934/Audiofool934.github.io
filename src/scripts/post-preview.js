document.querySelectorAll('.post-preview').forEach(preview => {
    const img = preview.querySelector('img');
    if (img) {
        // 确保图片加载完成
        img.onload = () => {
            img.style.visibility = 'visible';
        };

        preview.addEventListener('mousemove', (e) => {
            if (img.complete) {  // 只在图片加载完成后处理
                const rect = preview.getBoundingClientRect();
                img.style.left = (e.clientX - img.offsetWidth * (1-0.618)) + 'px';
                img.style.top = (e.clientY + window.scrollY + 20) + 'px';
            }
        });

        // 当鼠标离开时隐藏图片
        preview.addEventListener('mouseleave', () => {
            img.style.display = 'none';
        });

        // 当鼠标进入时显示图片
        preview.addEventListener('mouseenter', () => {
            if (img.complete) {
                img.style.display = 'block';
            }
        });
    }
});