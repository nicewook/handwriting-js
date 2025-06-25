const { PDFDocument, rgb, StandardFonts, PageSizes, mm } = require('pdf-lib');
const opentype = require('opentype.js');
const fs = require('fs').promises;
const fontkit = require('@pdf-lib/fontkit');

// --- 기본 설정값 ---
const FONT_PATH = 'RobotoMono-ExtraLightItalic.ttf';
const OUTPUT_PATH = 'practice_sheet_roboto.pdf';
const TOTAL_LINES = 22;

// --- 4-Zone 가이드라인 색상 및 스타일 설정 ---
const GUIDELINE_STYLES = {
    // 상단선 (Ascender line) - 대문자 상단
    ascender: {
        color: rgb(0.2, 0.2, 0.2),
        thickness: 0.8,
        style: 'solid'
    },
    // 중간선 영역 (X-height area) - 소문자 영역 사각형
    xheight_area: {
        color: rgb(0.0, 0.6, 0.0),
        thickness: 0.6,
        style: 'solid'
    },
    // 중간 보조선 (X-height middle) - 소문자 중간 (흐릿하게)
    xheight_mid: {
        color: rgb(0.7, 0.85, 0.7),
        thickness: 0.3,
        style: 'dashed',
        dashArray: [2, 3]
    },
    // 하단선 (Descender line) - 하향 문자 하단
    descender: {
        color: rgb(0.8, 0.2, 0.2),
        thickness: 0.6,
        style: 'solid'
    },
    // 텍스트 스타일
    text: {
        color: rgb(0.1, 0.1, 0.1),
        leftMargin: 5 // 사각형 테두리 안쪽 여백
    }
};

// --- 페이지 레이아웃 설정 (mm to points) ---
const LEFT_MARGIN = 25 * (1 / 25.4) * 72;
const RIGHT_MARGIN = 25 * (1 / 25.4) * 72;
const TOP_MARGIN = 20 * (1 / 25.4) * 72;
const BOTTOM_MARGIN = 20 * (1 / 25.4) * 72;

// --- 한 줄의 가이드라인 높이 설정 (mm to points) ---
const LINE_GROUP_HEIGHT = 5.5 * (1 / 25.4) * 72;

// --- 연습 문장 준비 ---
const text_blocks = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    [
        "The quick brown fox jumps over the lazy dog.",
        "Go placidly amid the noise and haste, and remember what peace there may be in silence.",
        "As far as possible, without surrender, be on good terms with all persons.",
        "Speak your truth quietly and clearly; and listen to others, even to the dull and the ignorant; they too have their story.",
        "Pack my box with five dozen liquor jugs.",
        "Sphinx of black quartz, judge my vow.",
        "You are a child of the universe, no less than the trees and the stars; you have a right to be here.",
        "And whether or not it is clear to you, no doubt the universe is unfolding as it should."
    ].join(" ")
];

async function createPdf() {
    try {
        // --- 폰트 로드 및 FONT_SIZE 동적 계산 ---
        const fontBytes = await fs.readFile(FONT_PATH);
        const font = await opentype.load(FONT_PATH);
        
        const upem = font.unitsPerEm;
        const x_height = font.tables.os2.sxHeight;

        // 4-Zone 가이드라인 시스템: 5개 선을 동일 간격으로 배치 (4개 간격)
        const line_spacing = LINE_GROUP_HEIGHT / 4; // 5개 선 = 4개 동일 간격
        
        // 소문자 높이 = 초록색 박스 높이 (2개 간격: 중간선 상단 ~ 중간선 하단)
        const x_height_in_pdf = line_spacing * 2; 
        
        // 폰트 크기 계산: 소문자가 초록색 박스에 정확히 맞도록
        const FONT_SIZE = (x_height_in_pdf / x_height) * upem;

        // --- PDF 생성 ---
        const doc = await PDFDocument.create();
        doc.registerFontkit(fontkit);

        const page = doc.addPage(PageSizes.A4);
        const { width, height } = page.getSize();
        
        const customFont = await doc.embedFont(fontBytes);

        // --- 자동 줄바꿈 로직 ---
        const drawable_width = width - LEFT_MARGIN - RIGHT_MARGIN;
        const wrapped_lines = [];

        for (const block of text_blocks) {
            const words = block.split(' ');
            if (words.length === 0) continue;

            let current_line = "";
            for (const word of words) {
                if (!current_line) {
                    current_line = word;
                    continue;
                }
                const test_line = current_line + " " + word;
                const text_width = customFont.widthOfTextAtSize(test_line, FONT_SIZE);
                
                if (text_width <= drawable_width) {
                    current_line = test_line;
                } else {
                    wrapped_lines.push(current_line);
                    current_line = word;
                }
            }
            if (current_line) {
                wrapped_lines.push(current_line);
            }
        }
        
        // --- 가이드 라인 및 텍스트 그리기 ---
        const drawable_height = height - TOP_MARGIN - BOTTOM_MARGIN;
        const slot_height = drawable_height / TOTAL_LINES;

        for (let i = 0; i < TOTAL_LINES; i++) {
            const slot_top_y = height - TOP_MARGIN - (i * slot_height);
            const group_center_y = slot_top_y - slot_height * 0.3;

            // 4-Zone 가이드라인: 5개 가로선을 동일 간격으로 정의 (아래부터 위로)
            const descender_line_y = group_center_y - (2 * line_spacing); // 하단선 (descender 하단)
            const baseline_y = group_center_y - line_spacing;              // 중간선 하단 (기준선)  
            const x_height_mid_y = group_center_y;                         // 중간선 가운데 (소문자 영역 중간)
            const x_height_top_y = group_center_y + line_spacing;          // 중간선 상단 (소문자 영역 위쪽)
            const ascender_line_y = group_center_y + (2 * line_spacing);   // 상단선 (대문자/ascender 상단)

            const line_start_x = LEFT_MARGIN;
            const line_end_x = width - RIGHT_MARGIN;
            
            // 디버깅: 첫 번째 라인에서 좌표 정보 출력
            if (i === 0) {
                console.log(`\n=== 가이드라인 좌표 정보 ===`);
                console.log(`line_spacing: ${line_spacing.toFixed(2)}pt`);
                console.log(`group_center_y: ${group_center_y.toFixed(2)}`);
                console.log(`상단선 (ascender): ${ascender_line_y.toFixed(2)}`);
                console.log(`중간선 상단 (x-height top): ${x_height_top_y.toFixed(2)}`);
                console.log(`중간선 가운데 (x-height mid): ${x_height_mid_y.toFixed(2)}`);
                console.log(`중간선 하단 (baseline): ${baseline_y.toFixed(2)}`);
                console.log(`하단선 (descender): ${descender_line_y.toFixed(2)}`);
                console.log(`간격 확인:`);
                console.log(`  상단→중간상단: ${(ascender_line_y - x_height_top_y).toFixed(2)}`);
                console.log(`  중간상단→중간가운데: ${(x_height_top_y - x_height_mid_y).toFixed(2)}`);
                console.log(`  중간가운데→중간하단: ${(x_height_mid_y - baseline_y).toFixed(2)}`);
                console.log(`  중간하단→하단: ${(baseline_y - descender_line_y).toFixed(2)}`);
                console.log(`========================\n`);
            }
            
            // 1. 상단선 (Ascender line) - 대문자/상향 문자 상단
            page.drawLine({ 
                start: { x: line_start_x, y: ascender_line_y }, 
                end: { x: line_end_x, y: ascender_line_y }, 
                color: GUIDELINE_STYLES.ascender.color, 
                thickness: GUIDELINE_STYLES.ascender.thickness 
            });
            
            // 2. 중간선 상단 (X-height top) - 소문자 영역 위쪽
            page.drawLine({ 
                start: { x: line_start_x, y: x_height_top_y }, 
                end: { x: line_end_x, y: x_height_top_y }, 
                color: GUIDELINE_STYLES.xheight_area.color, 
                thickness: GUIDELINE_STYLES.xheight_area.thickness 
            });
            
            // 3. 중간선 가운데 (X-height middle) - 소문자 영역 중간 (흐릿하게)
            page.drawLine({ 
                start: { x: line_start_x, y: x_height_mid_y }, 
                end: { x: line_end_x, y: x_height_mid_y }, 
                color: GUIDELINE_STYLES.xheight_mid.color, 
                thickness: GUIDELINE_STYLES.xheight_mid.thickness, 
                dashArray: GUIDELINE_STYLES.xheight_mid.dashArray 
            });
            
            // 4. 중간선 하단 (Baseline) - 소문자 영역 아래쪽, 기준선
            page.drawLine({ 
                start: { x: line_start_x, y: baseline_y }, 
                end: { x: line_end_x, y: baseline_y }, 
                color: GUIDELINE_STYLES.xheight_area.color, 
                thickness: GUIDELINE_STYLES.xheight_area.thickness 
            });
            
            // 5. 하단선 (Descender line) - 하향 문자 하단
            page.drawLine({ 
                start: { x: line_start_x, y: descender_line_y }, 
                end: { x: line_end_x, y: descender_line_y }, 
                color: GUIDELINE_STYLES.descender.color, 
                thickness: GUIDELINE_STYLES.descender.thickness 
            });
            
            // 중간선 영역 사각형 테두리 (3개 중간선의 외곽 영역)
            // 좌측 세로선
            page.drawLine({ 
                start: { x: line_start_x, y: x_height_top_y }, 
                end: { x: line_start_x, y: baseline_y }, 
                color: GUIDELINE_STYLES.xheight_area.color, 
                thickness: GUIDELINE_STYLES.xheight_area.thickness 
            });
            
            // 우측 세로선
            page.drawLine({ 
                start: { x: line_end_x, y: x_height_top_y }, 
                end: { x: line_end_x, y: baseline_y }, 
                color: GUIDELINE_STYLES.xheight_area.color, 
                thickness: GUIDELINE_STYLES.xheight_area.thickness 
            });

            // 텍스트는 짝수 줄에만 그리기 (연습용 예시 텍스트)
            if (i % 2 === 0) {
                const text_index = i / 2;
                if (text_index < wrapped_lines.length) {
                    const text = wrapped_lines[text_index];
                    page.drawText(text, {
                        x: LEFT_MARGIN + GUIDELINE_STYLES.text.leftMargin,
                        y: baseline_y,
                        font: customFont,
                        size: FONT_SIZE,
                        color: GUIDELINE_STYLES.text.color,
                    });
                }
            }
        }

        // --- 파일 저장 ---
        const pdfBytes = await doc.save();
        await fs.writeFile(OUTPUT_PATH, pdfBytes);
        console.log(`'${OUTPUT_PATH}' 파일이 성공적으로 생성되었습니다.`);
        console.log(`4-Zone 가이드라인 시스템 (5개 가로선) 적용됨:`);
        console.log(`  - 상단선: 대문자/상향 문자 상단 (검정색)`);
        console.log(`  - 중간선 상단: 소문자 영역 위쪽 (녹색)`);
        console.log(`  - 중간선 가운데: 소문자 영역 중간 (연녹색 점선, 흐릿하게)`);
        console.log(`  - 중간선 하단: 소문자 영역 아래쪽/기준선 (녹색)`);
        console.log(`  - 하단선: 하향 문자 하단 (빨간색)`);
        console.log(`  - 소문자 영역: 사각형 테두리로 강조`);
        console.log(`  - 폰트 크기: ${FONT_SIZE.toFixed(2)}pt`);

    } catch (error) {
        console.error("PDF 생성 중 오류가 발생했습니다:", error);
    }
}

createPdf(); 