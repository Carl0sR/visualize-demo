#!/usr/bin/env python3
"""Genera la hoja A4 desde el texto editable. Requiere reportlab y Liberation Sans."""
from pathlib import Path
from xml.sax.saxutils import escape
import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path('/usr/share/fonts/liberation-sans-fonts')
pdfmetrics.registerFont(TTFont('Body', str(FONTS / 'LiberationSans-Regular.ttf')))
pdfmetrics.registerFont(TTFont('BodyBold', str(FONTS / 'LiberationSans-Bold.ttf')))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold')
styles = {
    'title': ParagraphStyle('title', fontName='BodyBold', fontSize=20, leading=23, spaceAfter=7),
    'subtitle': ParagraphStyle('subtitle', fontName='Body', fontSize=10, leading=12, textColor=colors.HexColor('#46545f'), spaceAfter=10),
    'heading': ParagraphStyle('heading', fontName='BodyBold', fontSize=11.5, leading=13.5, spaceBefore=7, spaceAfter=3, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='Body', fontSize=10.7, leading=13.1, spaceAfter=5),
    'source': ParagraphStyle('source', fontName='Body', fontSize=9, leading=11, textColor=colors.HexColor('#364650'), spaceBefore=6, spaceAfter=5),
}
url = 'https://carl0sr.github.io/visualize-demo/madrid.html'
story = []
blocks = (ROOT / 'docs/dossier-gis-madrid.md').read_text().strip().split('\n\n')
for n, block in enumerate(blocks):
    style = 'body'
    if block.startswith('# '):
        style, block = 'title', block[2:]
    elif n == 1:
        style = 'subtitle'
    elif block.startswith('## '):
        style, block = 'heading', block[3:]
    elif block.startswith('Fuentes utilizadas:'):
        style = 'source'
    elif block.startswith('Demostración:'):
        block = f'Demostración: <link href="{url}" color="#155f78"><u>carl0sr.github.io/visualize-demo/madrid.html</u></link>'
        story.append(Paragraph(block, styles['source']))
        continue
    story.append(Paragraph(escape(block), styles[style]))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Body', 8)
    canvas.setFillColor(colors.HexColor('#46545f'))
    canvas.drawString(44, 25, 'Prueba de concepto con datos judiciales ficticios · 21 de octubre de 2026')
    canvas.drawRightString(A4[0] - 44, 25, str(doc.page))
    canvas.restoreState()

out = ROOT / 'docs/dossier-gis-madrid.pdf'
SimpleDocTemplate(str(out), pagesize=A4, leftMargin=44, rightMargin=44,
                  topMargin=33, bottomMargin=41,
                  title='Mapas para comprender el trabajo con expedientes',
                  author='Proyecto visualize-demo',
                  subject='Guía sencilla del potencial de GIS para justicia juvenil').build(story, onFirstPage=footer, onLaterPages=footer)
print(f'{out} · {len(re.findall(r"\S+", " ".join(blocks)))} palabras')
