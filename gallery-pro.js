/**
 * HỒNG SƠN ART - HỆ THỐNG TRIỂN LÃM MỸ THUẬT SỐ (DIGITAL GALLERY)
 * Tích hợp: Khung tranh Passe-partout, Bộ lọc lớp tự động, Lightbox xem tranh toàn màn hình
 * Dành cho khối 6, 7, 8, 9 - Trường THCS Cao Bá Quát
 */
(function () {
    const SPREADSHEET_ID = "1LIFdjnspgzZ44eYbs4-EIFmJhFkyFu01tP2qpckBUuA";
    const FORM_URL = "https://forms.gle/6RQduNzTrL7FHTKK6";
    const PADLET_URL = "https://padlet.com/hongsoncbqcse/padlet-bai-ve-cua-hoc-sinh-toi-s025vhs80f0kn5cdcj1l";

    // Tự động nhận diện khối lớp dựa trên tiêu đề trang hoặc thuộc tính data-grade
    const pageTitle = document.title || "";
    const gradeMatch = pageTitle.match(/Mỹ thuật\s*([6-9])/i) || window.location.pathname.match(/my-thuat-([6-9])/i);
    const currentGrade = document.body.getAttribute("data-grade") || (gradeMatch ? gradeMatch[1] : "7");

    // 1. CHÈN CSS CHUYÊN NGHIỆP CHO PHÒNG TRANH & LIGHTBOX
    const style = document.createElement("style");
    style.textContent = `
        /* Tinh chỉnh nút học liệu chưa có link (#) để không bị nhảy trang */
        a.res-btn[href="#"] {
            opacity: 0.55;
            cursor: default;
            position: relative;
        }
        a.res-btn[href="#"]:hover {
            transform: none !important;
        }

        /* Thanh công cụ Góc Triển Lãm */
        .gallery-toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            background: #FFFFFF;
            padding: 18px 22px;
            border-radius: 14px;
            border: 1px solid rgba(22, 43, 56, 0.08);
            box-shadow: 0 6px 20px rgba(22, 43, 56, 0.04);
            margin-bottom: 24px;
        }
        .exhibition-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .btn-submit-art {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #C85A32 0%, #A8431F 100%);
            color: #FFFFFF !important;
            padding: 11px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 4px 14px rgba(200, 90, 50, 0.28);
            transition: all 0.25s ease;
        }
        .btn-submit-art:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(200, 90, 50, 0.38); }

        .btn-padlet-wall {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #162B38;
            color: #D9A05B !important;
            padding: 11px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.25s ease;
        }
        .btn-padlet-wall:hover { background-color: #234254; transform: translateY(-2px); }

        /* Bộ lọc theo lớp */
        .class-filter-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }
        .filter-label {
            font-size: 12.5px;
            font-weight: 700;
            color: #5A626A;
            margin-right: 4px;
        }
        .filter-chip {
            border: 1px solid rgba(22, 43, 56, 0.15);
            background: #F9F6F0;
            color: #162B38;
            font-family: 'Be Vietnam Pro', sans-serif;
            font-size: 12.5px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-chip:hover { border-color: #C85A32; color: #C85A32; }
        .filter-chip.active {
            background: #162B38;
            color: #FFFFFF;
            border-color: #162B38;
        }

        /* Lưới trưng bày tranh nghệ thuật */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 28px;
        }

        /* Thẻ tác phẩm phong cách khung tranh phòng triển lãm */
        .artwork-card {
            background: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(22, 43, 56, 0.08);
            box-shadow: 0 10px 28px rgba(22, 43, 56, 0.06);
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }
        .artwork-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(22, 43, 56, 0.14);
        }

        /* Hiệu ứng bo khung (Matboard) quanh tác phẩm */
        .artwork-matboard {
            background: #F4EFE6;
            padding: 16px;
            border-bottom: 1px solid rgba(22, 43, 56, 0.06);
            position: relative;
        }
        .artwork-img-wrap {
            width: 100%;
            height: 230px;
            background: #E5DFD3;
            border: 4px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            overflow: hidden;
            position: relative;
        }
        .artwork-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.45s ease;
            display: block;
        }
        .artwork-card:hover .artwork-img-wrap img {
            transform: scale(1.05);
        }
        .artwork-class-badge {
            position: absolute;
            top: 24px;
            right: 24px;
            background: rgba(22, 43, 56, 0.9);
            color: #D9A05B;
            font-size: 11.5px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 2;
        }
        .artwork-zoom-hint {
            position: absolute;
            bottom: 24px;
            left: 24px;
            background: rgba(0, 0, 0, 0.65);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 6px;
            opacity: 0;
            transition: opacity 0.25s;
            z-index: 2;
        }
        .artwork-card:hover .artwork-zoom-hint { opacity: 1; }

        .artwork-body {
            padding: 20px 22px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .artwork-lesson {
            font-size: 11.5px;
            font-weight: 700;
            color: #C85A32;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .artwork-author {
            font-family: 'Playfair Display', serif;
            font-size: 19px;
            font-weight: 700;
            color: #162B38;
            margin-bottom: 10px;
        }
        .artwork-note {
            font-size: 13.5px;
            color: #5A626A;
            line-height: 1.65;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 16px;
        }
        .artwork-footer {
            border-top: 1px dashed rgba(22, 43, 56, 0.12);
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* LIGHTBOX MODAL PHÓNG TO TRANH TOÀN MÀN HÌNH */
        .art-lightbox {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(14, 24, 32, 0.92);
            backdrop-filter: blur(8px);
            z-index: 9999;
            padding: 24px;
            align-items: center;
            justify-content: center;
            animation: fadeInLightbox 0.25s ease;
        }
        .art-lightbox.open { display: flex; }
        @keyframes fadeInLightbox { from { opacity: 0; } to { opacity: 1; } }

        .lightbox-dialog {
            background: #FFFFFF;
            max-width: 1060px;
            width: 100%;
            max-height: 90vh;
            border-radius: 16px;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.35fr 1fr;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
            position: relative;
        }
        .lightbox-close {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(22, 43, 56, 0.85);
            color: #FFFFFF;
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: 0.2s;
        }
        .lightbox-close:hover { background: #C85A32; transform: rotate(90deg); }

        .lightbox-img-pane {
            background: #1B2228;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            max-height: 90vh;
        }
        .lightbox-img-pane img {
            max-width: 100%;
            max-height: 82vh;
            object-fit: contain;
            border: 6px solid #F9F6F0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .lightbox-info-pane {
            padding: 32px 28px;
            overflow-y: auto;
            max-height: 90vh;
            background: #F9F6F0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .lightbox-badge {
            display: inline-block;
            background: #162B38;
            color: #D9A05B;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
        }
        .lightbox-title {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #162B38;
            margin-bottom: 6px;
        }
        .lightbox-lesson {
            font-size: 13px;
            font-weight: 700;
            color: #C85A32;
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 1px solid rgba(22, 43, 56, 0.1);
        }
        .lightbox-story {
            font-size: 14.5px;
            color: #22252A;
            line-height: 1.75;
            white-space: pre-line;
        }

        @media (max-width: 820px) {
            .lightbox-dialog { grid-template-columns: 1fr; overflow-y: auto; }
            .lightbox-img-pane { max-height: 45vh; }
            .lightbox-info-pane { max-height: none; }
        }
    `;
    document.head.appendChild(style);

    // Chặn hành vi nhảy lên đầu trang với các nút học liệu đang cập nhật (href="#")
    document.querySelectorAll('a.res-btn[href="#"]').forEach(btn => {
        btn.title = "Học liệu đang được thầy Đỗ Hồng Sơn cập nhật";
        btn.addEventListener("click", e => e.preventDefault());
    });

    // Tự động thêm nút "Góc Triển Lãm" vào thanh điều hướng đầu trang nếu chưa có
    const jumpBar = document.querySelector(".semester-jump");
    if (jumpBar && !jumpBar.querySelector('a[href="#goc-trien-lam"]')) {
        const jumpLink = document.createElement("a");
        jumpLink.href = "#goc-trien-lam";
        jumpLink.className = "jump-btn";
        jumpLink.style.cssText = "background: #FDF0EC; color: #C85A32;";
        jumpLink.textContent = "🎨 Góc Triển Lãm Học Sinh";
        jumpBar.appendChild(jumpLink);
    }

    // 2. DỰNG KHUNG GIAO DIỆN GÓC TRIỂN LÃM & LIGHTBOX
    const container = document.querySelector(".container");
    if (!container) return;

    // Xóa khung cũ nếu đã chèn trước đó để tránh trùng lặp
    const oldDivider = document.getElementById("goc-trien-lam");
    if (oldDivider) {
        const oldGroup = oldDivider.nextElementSibling;
        if (oldGroup && oldGroup.classList.contains("topic-group")) oldGroup.remove();
        oldDivider.remove();
    }

    const gallerySectionHTML = `
        <div class="semester-divider" id="goc-trien-lam" style="background: linear-gradient(135deg, #2B1E1A 0%, #4A2E23 100%);">
            GÓC TRIỂN LÃM SẢN PHẨM HỌC SINH <span>Tác phẩm tiêu biểu Khối ${currentGrade}</span>
        </div>

        <div class="topic-group">
            <h2 class="topic-title">
                <span class="topic-badge" style="background-color: #C85A32;">PHÒNG TRANH SỐ</span> 
                Trưng bày tác phẩm & Cảm nhận sáng tạo của học sinh
            </h2>

            <div class="gallery-toolbar">
                <div class="exhibition-actions">
                    <a href="${FORM_URL}" target="_blank" class="btn-submit-art">📤 Nộp bài vẽ lên Góc triển lãm</a>
                    <a href="${PADLET_URL}" target="_blank" class="btn-padlet-wall">🎨 Tường Padlet & Bình luận ↗</a>
                </div>
                <div class="class-filter-bar" id="class-filter-bar">
                    <span class="filter-label">Lọc theo lớp:</span>
                    <button class="filter-chip active" data-class="ALL">Tất cả</button>
                </div>
            </div>

            <div id="student-gallery-container" class="gallery-grid">
                <div class="lesson-card" style="grid-column: 1 / -1; text-align: center; color: #5A626A;">
                    Đang tải các tác phẩm đã duyệt từ phòng trưng bày...
                </div>
            </div>
        </div>

        <!-- Hộp đèn Lightbox phóng to tác phẩm -->
        <div class="art-lightbox" id="art-lightbox">
            <div class="lightbox-dialog">
                <button class="lightbox-close" id="lightbox-close" title="Đóng (ESC)">✕</button>
                <div class="lightbox-img-pane">
                    <img id="lb-img" src="" alt="Tác phẩm học sinh">
                </div>
                <div class="lightbox-info-pane">
                    <div>
                        <span class="lightbox-badge" id="lb-class">Lớp</span>
                        <h3 class="lightbox-title" id="lb-author">Học sinh</h3>
                        <div class="lightbox-lesson" id="lb-lesson">Chủ đề bài học</div>
                        <div class="lightbox-story" id="lb-story"></div>
                    </div>
                    <div style="margin-top: 24px; padding-top: 14px; border-top: 1px dashed rgba(22,43,56,0.15); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; color: #5A626A;">Hồng Sơn Art · THCS Cao Bá Quát</span>
                        <a id="lb-drive-link" href="#" target="_blank" class="res-btn btn-slide">Mở ảnh gốc Drive ↗</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", gallerySectionHTML);

    // 3. XỬ LÝ DỮ LIỆU TỪ GOOGLE SHEET & SỰ KIỆN LIGHTBOX
    function convertDriveImg(url) {
        if (!url) return "";
        const match = url.match(/[-\w]{25,}/);
        return match ? `https://lh3.googleusercontent.com/d/${match[0]}=w1200` : url;
    }

    function getDriveViewLink(url) {
        if (!url) return "#";
        const match = url.match(/[-\w]{25,}/);
        return match ? `https://drive.google.com/file/d/${match[0]}/view` : url;
    }

    const lightbox = document.getElementById("art-lightbox");
    const closeBtn = document.getElementById("lightbox-close");

    function openLightbox(work) {
        document.getElementById("lb-img").src = work.imgDirect;
        document.getElementById("lb-class").textContent = "Lớp " + work.className;
        document.getElementById("lb-author").textContent = work.author;
        document.getElementById("lb-lesson").textContent = work.lesson;
        document.getElementById("lb-story").textContent = work.caption || "Học sinh chưa nhập lời cảm nhận cho tác phẩm này.";
        document.getElementById("lb-drive-link").href = work.imgFull;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

    let allGradeWorks = [];

    function renderWorks(filterClass) {
        const galleryContainer = document.getElementById("student-gallery-container");
        const list = filterClass === "ALL"
            ? allGradeWorks
            : allGradeWorks.filter(w => w.className.toUpperCase() === filterClass.toUpperCase());

        if (list.length === 0) {
            galleryContainer.innerHTML = `<div class="lesson-card" style="grid-column: 1 / -1; text-align: center; color: #5A626A;">Chưa có bài vẽ nào của Khối ${currentGrade} được duyệt hiển thị. Các em hãy nhấn nút <strong>"📤 Nộp bài vẽ lên Góc triển lãm"</strong> phía trên để gửi tác phẩm nhé!</div>`;
            return;
        }

        galleryContainer.innerHTML = list.map((w, idx) => `
            <div class="artwork-card" data-idx="${idx}">
                <div class="artwork-matboard">
                    <span class="artwork-class-badge">Lớp ${w.className}</span>
                    <span class="artwork-zoom-hint">🔍 Nhấn để phóng to & đọc cảm nhận</span>
                    <div class="artwork-img-wrap">
                        <img src="${w.imgDirect}" alt="${w.lesson} - ${w.author}" loading="lazy" onerror="this.src='https://placehold.co/600x400/EAE5DC/162B38?text=Chưa+mở+quyền+xem+ảnh+Drive'">
                    </div>
                </div>
                <div class="artwork-body">
                    <div>
                        <div class="artwork-lesson">${w.lesson}</div>
                        <div class="artwork-author">${w.author}</div>
                        <p class="artwork-note">${w.caption}</p>
                    </div>
                    <div class="artwork-footer">
                        <span style="font-size: 12px; color: #5A626A; font-weight: 500;">✨ Tác phẩm tiêu biểu</span>
                        <span class="res-btn btn-doc">Xem chi tiết →</span>
                    </div>
                </div>
            </div>
        `).join("");

        // Gắn sự kiện mở Lightbox cho từng thẻ tranh
        galleryContainer.querySelectorAll(".artwork-card").forEach(card => {
            card.addEventListener("click", () => {
                const idx = parseInt(card.getAttribute("data-idx"), 10);
                openLightbox(list[idx]);
            });
        });
    }

    const galleryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Form_Responses`;

    fetch(galleryUrl)
        .then(res => res.text())
        .then(raw => {
            const jsonStr = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            const rows = data.table.rows || [];

            allGradeWorks = rows
                .map(r => (r.c || []).map(cell => cell ? (cell.f || cell.v || "").toString().trim() : ""))
                .filter(cols => {
                    const lop = cols[3] || "";
                    const trangThai = (cols[7] || "").toLowerCase();
                    return lop.startsWith(currentGrade) && trangThai.includes("duyệt");
                })
                .reverse()
                .map(w => ({
                    author: w[2] || "Học sinh",
                    className: (w[3] || "").toUpperCase(),
                    lesson: w[4] || "Sản phẩm Mỹ thuật",
                    caption: w[5] || "",
                    imgDirect: convertDriveImg(w[6]),
                    imgFull: getDriveViewLink(w[6])
                }));

            // Tạo các nút lọc lớp tự động (ví dụ: Tất cả, 7A1, 7A2...)
            const filterBar = document.getElementById("class-filter-bar");
            const uniqueClasses = [...new Set(allGradeWorks.map(w => w.className).filter(Boolean))].sort();
            uniqueClasses.forEach(cls => {
                const btn = document.createElement("button");
                btn.className = "filter-chip";
                btn.setAttribute("data-class", cls);
                btn.textContent = cls;
                filterBar.appendChild(btn);
            });

            filterBar.querySelectorAll(".filter-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    filterBar.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
                    chip.classList.add("active");
                    renderWorks(chip.getAttribute("data-class"));
                });
            });

            renderWorks("ALL");
        })
        .catch(() => {
            document.getElementById("student-gallery-container").innerHTML = `<div class="lesson-card" style="grid-column: 1 / -1; text-align: center; color: #C85A32;">Không thể kết nối dữ liệu phòng tranh. Anh Sơn vui lòng kiểm tra lại kết nối mạng hoặc tab <strong>Form_Responses</strong>.</div>`;
        });
})();
