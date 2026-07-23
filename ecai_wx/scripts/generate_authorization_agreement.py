from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "agreements"
FONT_PATH = Path(r"C:\Windows\Fonts\simhei.ttf")
FONT_NAME = "SimHei"


def register_font() -> None:
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"Chinese font not found: {FONT_PATH}")
    pdfmetrics.registerFont(TTFont(FONT_NAME, str(FONT_PATH)))


def draw_page(canvas, doc, signed: bool) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D9E2E5"))
    canvas.line(22 * mm, 18 * mm, width - 22 * mm, 18 * mm)
    canvas.setFont(FONT_NAME, 8)
    canvas.setFillColor(colors.HexColor("#7B8794"))
    canvas.drawString(22 * mm, 11 * mm, "标贝易采 · 数据使用授权协议")
    canvas.drawRightString(width - 22 * mm, 11 * mm, f"第 {doc.page} 页")

    if signed and doc.page == 2:
        canvas.setStrokeColor(colors.HexColor("#1E5B8F"))
        canvas.setLineWidth(2.4)
        path = canvas.beginPath()
        path.moveTo(120 * mm, 119 * mm)
        path.curveTo(128 * mm, 134 * mm, 133 * mm, 113 * mm, 140 * mm, 128 * mm)
        path.curveTo(145 * mm, 139 * mm, 151 * mm, 116 * mm, 158 * mm, 129 * mm)
        path.curveTo(161 * mm, 135 * mm, 166 * mm, 124 * mm, 171 * mm, 132 * mm)
        canvas.drawPath(path)
        canvas.setFont(FONT_NAME, 8)
        canvas.setFillColor(colors.HexColor("#315C78"))
        canvas.drawString(119 * mm, 113 * mm, "作业员签署：张明")
        canvas.drawString(119 * mm, 101 * mm, "签署时间：2026-07-22 18:46")
    canvas.restoreState()


def build_pdf(path: Path, signed: bool) -> None:
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleCN", parent=styles["Title"], fontName=FONT_NAME, fontSize=20,
        leading=30, textColor=colors.HexColor("#243B53"), alignment=TA_CENTER,
        spaceAfter=14 * mm,
    )
    heading = ParagraphStyle(
        "HeadingCN", parent=styles["Heading2"], fontName=FONT_NAME, fontSize=12,
        leading=20, textColor=colors.HexColor("#247F69"), spaceBefore=5 * mm,
        spaceAfter=3 * mm,
    )
    body = ParagraphStyle(
        "BodyCN", parent=styles["BodyText"], fontName=FONT_NAME, fontSize=10,
        leading=19, textColor=colors.HexColor("#3F4F5F"), spaceAfter=3 * mm,
    )
    small = ParagraphStyle(
        "SmallCN", parent=body, fontSize=8.5, leading=15, textColor=colors.HexColor("#718096"),
    )

    doc = SimpleDocTemplate(
        str(path), pagesize=A4, leftMargin=24 * mm, rightMargin=24 * mm,
        topMargin=23 * mm, bottomMargin=24 * mm, title="数据使用授权协议",
        author="标贝易采",
    )

    story = [
        Paragraph("数据使用授权协议", title),
        Table(
            [
                ["协议编号", "AUTH-PRJ-2026-071-v2.2"],
                ["项目名称", "普通话语音采集项目"],
                ["被授权机构", "标贝（北京）科技有限公司"],
                ["协议版本", "v2.2"],
            ],
            colWidths=[34 * mm, 112 * mm],
            style=TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#718096")),
                ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#2D3748")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F6FAF9")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D9E7E3")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5ECEF")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]),
        ),
        Spacer(1, 7 * mm),
        Paragraph("一、授权目的", heading),
        Paragraph("本人自愿授权被授权机构在本项目范围内收集和使用本人提交的数据，用于语音识别模型训练、数据质量评估与项目验收。机构不得将数据用于本协议未明确说明的用途。", body),
        Paragraph("二、授权范围", heading),
        Paragraph("1. 基础身份信息：昵称、年龄区间、所在地区；<br/>2. 语音样本：本项目内提交的普通话朗读与自然对话录音；<br/>3. 设备信息：设备型号、系统版本和网络类型；<br/>4. 任务结果：与语音样本对应的朗读文本、质检结论和必要标签。", body),
        Paragraph("三、处理和保护规则", heading),
        Paragraph("平台对个人信息和采集数据采取访问控制、脱敏、加密存储及操作留痕措施。未经授权，不向无关第三方公开披露可识别个人身份的信息。", body),
        Paragraph("四、授权期限", heading),
        Paragraph("本授权自完成签署之日起生效，有效期为 365 天。到期后，相关机构不得继续获取该用户新增数据；涉及法定留存义务的记录按法律规定处理。", body),
        PageBreak(),
        Paragraph("数据使用授权协议（签署页）", title),
        Paragraph("五、授权确认方式", heading),
        Paragraph("本协议采用“短信确认 + 签名授权”方式完成身份确认。电子签名与签署时间作为授权记录的一部分，与本协议版本快照一并保存。", body),
        Paragraph("六、用户权利", heading),
        Paragraph("用户有权在授权中心查看授权内容、授权状态和签署后的协议文件，并可依法申请撤回授权。撤回不影响撤回前基于有效授权已开展的数据处理活动。", body),
        Paragraph("七、签署声明", heading),
        Paragraph("本人已完整阅读并理解本协议，确认授权范围、使用目的、有效期限和本人权利，同意通过电子签名方式签署本协议。", body),
        Spacer(1, 18 * mm),
        Table(
            [["作业员签名", ""], ["签署时间", "系统将在签署完成后自动写入"]],
            colWidths=[34 * mm, 112 * mm], rowHeights=[36 * mm, 13 * mm],
            style=TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#526475")),
                ("TEXTCOLOR", (1, 1), (1, 1), colors.HexColor("#9AA6B2")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD8DD")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E1E8EB")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]),
        ),
        Spacer(1, 7 * mm),
        Paragraph("提示：签署完成后，平台将生成带有作业员电子署名的只读 PDF 文件，并在授权中心长期保留该授权版本快照。", small),
    ]

    callback = lambda canvas, current_doc: draw_page(canvas, current_doc, signed)
    doc.build(story, onFirstPage=callback, onLaterPages=callback)


def main() -> None:
    register_font()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_pdf(OUTPUT_DIR / "authorization-agreement.pdf", signed=False)
    build_pdf(OUTPUT_DIR / "signed-authorization-agreement.pdf", signed=True)
    print(f"Generated agreements in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
