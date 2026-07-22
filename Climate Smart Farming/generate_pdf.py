import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
)
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle, Polygon, Group

# --- Numbered Canvas for "Page X of Y" ---
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        # Suppress page numbers on the Cover Page (Page 1)
        if self._pageNumber == 1:
            return
        
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#5F6E5F"))
        
        # Header (Top of Page)
        self.drawString(54, 790, "Climate Smart Farming Advisory System — System Documentation")
        self.setStrokeColor(colors.HexColor("#D3D8CA"))
        self.setLineWidth(0.5)
        self.line(54, 782, 541, 782)
        
        # Footer (Bottom of Page)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 40, page_text)
        
        # Roman numerals for preliminary pages, arabic for chapters
        # Since we'll let ReportLab count standard pages, a simple X of Y is perfect for a student thesis layout.
        self.drawString(54, 40, "Zetech University | Department of Computer Science")
        self.line(54, 52, 541, 52)
        
        self.restoreState()

# --- Vector UML & Diagram Generator ---
def create_flowchart():
    d = Drawing(460, 260)
    # Background border
    d.add(Rect(0, 0, 460, 260, fillColor=colors.HexColor("#FAFAF6"), strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1, rx=5, ry=5))
    
    # 1. Start Oval
    d.add(Rect(180, 225, 100, 25, fillColor=colors.HexColor("#1B5E20"), strokeColor=colors.HexColor("#124116"), rx=12, ry=12))
    d.add(String(230, 233, "START", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.white, textAnchor="middle"))
    
    # Arrow 1
    d.add(Line(230, 225, 230, 205, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    
    # 2. Display Login (Rect)
    d.add(Rect(160, 180, 140, 25, fillColor=colors.HexColor("#E8F5E9"), strokeColor=colors.HexColor("#1B5E20"), rx=3, ry=3))
    d.add(String(230, 188, "Display Login Screen", fontName="Helvetica", fontSize=9, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Arrow 2
    d.add(Line(230, 180, 230, 160, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    
    # 3. Enter Credentials (Parallelogram)
    points = [160, 135, 290, 135, 305, 160, 175, 160]
    d.add(Polygon(points, fillColor=colors.HexColor("#E8F5E9"), strokeColor=colors.HexColor("#1B5E20")))
    d.add(String(232, 144, "Enter User/Password", fontName="Helvetica", fontSize=9, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Arrow 3
    d.add(Line(230, 135, 230, 115, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    
    # 4. Fields Empty? (Diamond)
    d.add(Polygon([230, 115, 280, 95, 230, 75, 180, 95], fillColor=colors.HexColor("#FFF9C4"), strokeColor=colors.HexColor("#FBC02D")))
    d.add(String(230, 92, "Fields Empty?", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Yes -> Back Arrow
    d.add(Line(180, 95, 100, 95, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Line(100, 95, 100, 192, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Line(100, 192, 160, 192, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(String(130, 100, "YES (Prompt Fill)", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#B91C1C"), textAnchor="middle"))
    
    # No -> Arrow Down
    d.add(Line(230, 75, 230, 55, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(String(238, 62, "NO", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#1B5E20")))
    
    # 5. Auth Query (Rect)
    d.add(Rect(150, 30, 160, 25, fillColor=colors.HexColor("#E8F5E9"), strokeColor=colors.HexColor("#1B5E20"), rx=3, ry=3))
    d.add(String(230, 38, "Query DB (JWT Token)", fontName="Helvetica", fontSize=9, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Next Arrow to end/authenticate
    d.add(Line(230, 30, 230, 15, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(180, 2, 100, 13, fillColor=colors.HexColor("#1B5E20"), strokeColor=colors.HexColor("#124116"), rx=5, ry=5))
    d.add(String(230, 5, "AUTHENTICATED", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    
    return d

def create_usecase_diagram():
    d = Drawing(460, 240)
    d.add(Rect(0, 0, 460, 240, fillColor=colors.HexColor("#FAFAF6"), strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1, rx=5, ry=5))
    
    # System boundary box
    d.add(Rect(120, 10, 220, 220, fillColor=colors.white, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5, rx=8, ry=8))
    d.add(String(230, 218, "Climate-Smart System Boundary", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#1B5E20"), textAnchor="middle"))
    
    # Actor 1: Farmer (Left)
    # Head
    d.add(Circle(60, 130, 10, fillColor=colors.HexColor("#E8F5E9"), strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    # Body line
    d.add(Line(60, 120, 60, 90, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    # Arms
    d.add(Line(45, 110, 75, 110, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    # Legs
    d.add(Line(60, 90, 48, 65, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    d.add(Line(60, 90, 72, 65, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    d.add(String(60, 48, "FARMER", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Actor 2: Agronomist (Right)
    # Head
    d.add(Circle(400, 130, 10, fillColor=colors.HexColor("#ECEFE6"), strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    # Body
    d.add(Line(400, 120, 400, 90, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    # Arms
    d.add(Line(385, 110, 415, 110, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    # Legs
    d.add(Line(400, 90, 388, 65, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Line(400, 90, 412, 65, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(String(400, 48, "AGRONOMIST", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    # Use cases (Ellipses)
    uc_y = [180, 145, 110, 75, 40]
    uc_labels = [
        "Authenticate & Profile Edit",
        "View Weather & Mapbox API",
        "Soil & Pest Telemetry",
        "Private Chat Consultation",
        "Farmer Directory Sync"
    ]
    
    for y, label in zip(uc_y, uc_labels):
        d.add(Rect(140, y-10, 180, 20, fillColor=colors.HexColor("#FAFAF6"), strokeColor=colors.HexColor("#5F6E5F"), rx=8, ry=8))
        d.add(String(230, y-4, label, fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
        
        # Link Farmer
        d.add(Line(75, 105, 140, y, strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1))
        # Link Agronomist (to profile edit, chat and soil telemetry)
        if y in [180, 110, 75]:
            d.add(Line(385, 105, 320, y, strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1))
            
    return d

def create_class_diagram():
    d = Drawing(460, 220)
    d.add(Rect(0, 0, 460, 220, fillColor=colors.HexColor("#FAFAF6"), strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1, rx=5, ry=5))
    
    # Class 1: CustomUser
    d.add(Rect(20, 110, 120, 95, fillColor=colors.white, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    d.add(Rect(20, 190, 120, 15, fillColor=colors.HexColor("#1B5E20"), strokeColor=colors.HexColor("#1B5E20")))
    d.add(String(80, 194, "CustomUser", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.white, textAnchor="middle"))
    d.add(String(25, 178, "- name: String", fontName="Helvetica", fontSize=7))
    d.add(String(25, 168, "- email: String", fontName="Helvetica", fontSize=7))
    d.add(String(25, 158, "- sector: String", fontName="Helvetica", fontSize=7))
    d.add(String(25, 148, "- role: Enum", fontName="Helvetica", fontSize=7))
    d.add(Line(20, 142, 140, 142, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=0.5))
    d.add(String(25, 130, "+ updateProfile()", fontName="Helvetica", fontSize=7))
    d.add(String(25, 120, "+ register()", fontName="Helvetica", fontSize=7))
    
    # Class 2: SoilMetric
    d.add(Rect(170, 110, 120, 95, fillColor=colors.white, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    d.add(Rect(170, 190, 120, 15, fillColor=colors.HexColor("#1B5E20"), strokeColor=colors.HexColor("#1B5E20")))
    d.add(String(230, 194, "SoilMetric", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.white, textAnchor="middle"))
    d.add(String(175, 178, "- sector: String", fontName="Helvetica", fontSize=7))
    d.add(String(175, 168, "- moisture: Int", fontName="Helvetica", fontSize=7))
    d.add(String(175, 158, "- ph: Float", fontName="Helvetica", fontSize=7))
    d.add(String(175, 148, "- NPK: Int[3]", fontName="Helvetica", fontSize=7))
    d.add(Line(170, 142, 290, 142, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=0.5))
    d.add(String(175, 130, "+ get_by_sector()", fontName="Helvetica", fontSize=7))
    d.add(String(175, 120, "+ save_telemetry()", fontName="Helvetica", fontSize=7))

    # Class 3: BusinessProfile
    d.add(Rect(320, 110, 120, 95, fillColor=colors.white, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1.5))
    d.add(Rect(320, 190, 120, 15, fillColor=colors.HexColor("#1B5E20"), strokeColor=colors.HexColor("#1B5E20")))
    d.add(String(380, 194, "BusinessProfile", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.white, textAnchor="middle"))
    d.add(String(325, 178, "- user: FK", fontName="Helvetica", fontSize=7))
    d.add(String(325, 168, "- name: String", fontName="Helvetica", fontSize=7))
    d.add(String(325, 158, "- produce: String", fontName="Helvetica", fontSize=7))
    d.add(String(325, 148, "- location: String", fontName="Helvetica", fontSize=7))
    d.add(Line(320, 142, 440, 142, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=0.5))
    d.add(String(325, 130, "+ create_profile()", fontName="Helvetica", fontSize=7))
    d.add(String(325, 120, "+ sync_offline()", fontName="Helvetica", fontSize=7))

    # Associations
    # User to BusinessProfile
    d.add(Line(140, 157, 170, 157, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Line(290, 157, 320, 157, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(String(155, 162, "1", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor("#212521")))
    d.add(String(305, 162, "0..1", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor("#212521")))

    # Explanatory Legend
    d.add(Rect(100, 15, 260, 45, fillColor=colors.HexColor("#ECEFE6"), strokeColor=colors.HexColor("#D3D8CA"), rx=4, ry=4))
    d.add(String(230, 45, "Class diagram mapping frontend context modules", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#1B5E20"), textAnchor="middle"))
    d.add(String(230, 33, "to Django rest framework API controllers", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    d.add(String(230, 21, "and local storage cache buffers.", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor("#212521"), textAnchor="middle"))
    
    return d

def create_erd_diagram():
    d = Drawing(460, 240)
    d.add(Rect(0, 0, 460, 240, fillColor=colors.HexColor("#FAFAF6"), strokeColor=colors.HexColor("#D3D8CA"), strokeWidth=1, rx=5, ry=5))
    
    # 1. USER TABLE
    d.add(Rect(20, 140, 110, 80, fillColor=colors.white, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(20, 205, 110, 15, fillColor=colors.HexColor("#A7805A"), strokeColor=colors.HexColor("#A7805A")))
    d.add(String(75, 209, "auth_user (PK)", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    d.add(String(25, 195, "PK: id (Int)", fontName="Helvetica-Bold", fontSize=7))
    d.add(String(25, 185, "username (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 175, "sector (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 165, "role (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 155, "phone_number (Var)", fontName="Helvetica", fontSize=6.5))
    
    # 2. MESSAGE TABLE
    d.add(Rect(170, 140, 110, 80, fillColor=colors.white, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(170, 205, 110, 15, fillColor=colors.HexColor("#A7805A"), strokeColor=colors.HexColor("#A7805A")))
    d.add(String(225, 209, "chat_message (PK)", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    d.add(String(175, 195, "PK: id (Int)", fontName="Helvetica-Bold", fontSize=7))
    d.add(String(175, 185, "FK: sender_id", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 175, "subject (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 165, "message (Text)", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 155, "reply (Text)", fontName="Helvetica", fontSize=6.5))

    # 3. SOIL_METRIC TABLE
    d.add(Rect(320, 140, 110, 80, fillColor=colors.white, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(320, 205, 110, 15, fillColor=colors.HexColor("#A7805A"), strokeColor=colors.HexColor("#A7805A")))
    d.add(String(375, 209, "soil_metric (PK)", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    d.add(String(325, 195, "PK: id (Int)", fontName="Helvetica-Bold", fontSize=7))
    d.add(String(325, 185, "sector (Var, UK)", fontName="Helvetica", fontSize=6.5))
    d.add(String(325, 175, "moisture (Int)", fontName="Helvetica", fontSize=6.5))
    d.add(String(325, 165, "ph (Float)", fontName="Helvetica", fontSize=6.5))
    d.add(String(325, 155, "NPK values (Int)", fontName="Helvetica", fontSize=6.5))

    # 4. BUSINESS_PROFILE TABLE
    d.add(Rect(170, 20, 110, 80, fillColor=colors.white, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(170, 85, 110, 15, fillColor=colors.HexColor("#A7805A"), strokeColor=colors.HexColor("#A7805A")))
    d.add(String(225, 89, "business_profile (PK)", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    d.add(String(175, 75, "PK: id (Int)", fontName="Helvetica-Bold", fontSize=7))
    d.add(String(175, 65, "FK: user_id", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 55, "produce (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 45, "location (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(175, 35, "phone_number (Var)", fontName="Helvetica", fontSize=6.5))

    # 5. PEST_ALERT TABLE
    d.add(Rect(20, 20, 110, 80, fillColor=colors.white, strokeColor=colors.HexColor("#A7805A"), strokeWidth=1.5))
    d.add(Rect(20, 85, 110, 15, fillColor=colors.HexColor("#A7805A"), strokeColor=colors.HexColor("#A7805A")))
    d.add(String(75, 89, "pest_alert (PK)", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.white, textAnchor="middle"))
    d.add(String(25, 75, "PK: id (Int)", fontName="Helvetica-Bold", fontSize=7))
    d.add(String(25, 65, "title (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 55, "risk_level (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 45, "sector (Var)", fontName="Helvetica", fontSize=6.5))
    d.add(String(25, 35, "mitigation (Text)", fontName="Helvetica", fontSize=6.5))

    # Lines & Cardinality notations
    # auth_user to message (1:M)
    d.add(Line(130, 180, 170, 180, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))
    d.add(Line(135, 175, 135, 185, strokeColor=colors.HexColor("#1B5E20"))) # 1 mark
    d.add(Line(165, 175, 170, 180, strokeColor=colors.HexColor("#1B5E20"))) # crows foot
    d.add(Line(165, 185, 170, 180, strokeColor=colors.HexColor("#1B5E20")))

    # auth_user to business_profile (1:1)
    d.add(Line(75, 140, 75, 110, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))
    d.add(Line(75, 110, 170, 60, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))
    
    # auth_user to pest_alert (1:M)
    d.add(Line(20, 160, 10, 160, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))
    d.add(Line(10, 160, 10, 60, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))
    d.add(Line(10, 60, 20, 60, strokeColor=colors.HexColor("#1B5E20"), strokeWidth=1))

    return d

# --- Build the Document ---
def build_pdf(filename):
    # Base setup
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Customized styles
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1B5E20"),
        alignment=1, # Center
        spaceAfter=15
    )
    
    cover_subtitle_style = ParagraphStyle(
        'CoverSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#A7805A"),
        alignment=1,
        spaceAfter=150
    )
    
    cover_meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=16,
        textColor=colors.HexColor("#212521"),
        alignment=1,
        spaceAfter=150
    )

    cover_date_style = ParagraphStyle(
        'CoverDate',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor("#212521"),
        alignment=1
    )

    h1_style = ParagraphStyle(
        'ChapterHeading',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#1B5E20"),
        spaceBefore=22,
        spaceAfter=12,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#A7805A"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'SubSubHeading',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#212521"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#212521"),
        spaceAfter=8
    )

    list_style = ParagraphStyle(
        'ListTextCustom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    quote_style = ParagraphStyle(
        'QuoteText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor("#5F6E5F"),
        leftIndent=20,
        rightIndent=20,
        spaceBefore=6,
        spaceAfter=6
    )

    story = []

    # ==========================================
    # COVER PAGE
    # ==========================================
    story.append(Spacer(1, 50))
    story.append(Paragraph("CLIMATE SMART ADVISORY SYSTEM", cover_title_style))
    story.append(Paragraph("SYSTEM DOCUMENTATION", cover_subtitle_style))
    
    meta_text = """
    <b>SUBMITTED BY:</b><br/>
    MERLYN ACHAR<br/>
    ADMIN NO: DSE-02-0159/2025<br/>
    PROGRAMME: DIPLOMA IN SOFTWARE ENGINEERING<br/>
    <br/><br/>
    A SYSTEM DOCUMENTATION SUBMITTED IN PARTIAL FULFILMENT FOR THE AWARD OF<br/>
    DIPLOMA IN SOFTWARE ENGINEERING BY ZETECH UNIVERSITY
    """
    story.append(Paragraph(meta_text, cover_meta_style))
    story.append(Spacer(1, 80))
    story.append(Paragraph("APRIL, 2026", cover_date_style))
    story.append(PageBreak())

    # ==========================================
    # PRELIMINARY PAGES: DECLARATION
    # ==========================================
    story.append(Paragraph("DECLARATION", h1_style))
    story.append(Spacer(1, 15))
    dec_text = """
    I declare that this project is original, has been planned, modeled and created by me
    and reported in this documentation, which is also original and non-plagiarized.<br/><br/><br/>
    <b>Student Name:</b> Merlyn Achar &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Admin No:</b> DSE-02-0159/2025<br/><br/>
    <b>Student Signature:</b> ___________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Date:</b> ____________________<br/><br/><br/><br/>
    This system documentation has been submitted for examination with my approval as university supervisor.<br/><br/><br/>
    <b>Supervisor Name:</b> Mr. Mutuku Francis &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Signature:</b> ____________________
    """
    story.append(Paragraph(dec_text, body_style))
    story.append(PageBreak())

    # ==========================================
    # PRELIMINARY PAGES: ACKNOWLEDGEMENT
    # ==========================================
    story.append(Paragraph("ACKNOWLEDGEMENT", h1_style))
    story.append(Spacer(1, 15))
    ack_text = """
    I would like to acknowledge my supervisor, Mr. Mutuku Francis, for the step-by-step guidance,
    technical feedback, and academic supervision he has provided throughout the semesters of this project.
    His advice was crucial in aligning the system specifications with practical software engineering standards.<br/><br/>
    I also express my appreciation to my family and peers for their continuous support, motivation, and help in
    testing and refining the application interfaces.
    """
    story.append(Paragraph(ack_text, body_style))
    story.append(PageBreak())

    # ==========================================
    # PRELIMINARY PAGES: ABSTRACT
    # ==========================================
    story.append(Paragraph("ABSTRACT", h1_style))
    story.append(Spacer(1, 15))
    abstract_text = """
    Agriculture remains the backbone of Kenya's economy, yet climate change continues to disrupt farming systems
    through erratic rainfall, prolonged droughts, rising temperatures, soil degradation, and pest outbreaks. Smallholder farmers,
    who produce the majority of the country's food, face increasing vulnerability due to limited access to localized and timely advisory services.
    This project proposes the design and development of a Climate-Smart Farming Advisory System (GreenAcres) that integrates weather forecasts,
    soil health data, pest alerts, and market information into a unified ICT-enabled platform.<br/><br/>
    Using an Agile development approach, the system emphasizes iterative updates, farmer participation, and adaptability to dynamic conditions.
    The objectives are to provide region-specific advisory services, promote sustainable farming practices, strengthen resilience against climate risks,
    and enhance food security and livelihoods. By addressing the fragmentation of existing systems, the proposed solution successfully resolves
    the delivery gaps in localized soil health and pest threat recommendations, including PCPB registered treatments and Koppert Kenya biocontrol programs.
    """
    story.append(Paragraph(abstract_text, body_style))
    story.append(PageBreak())

    # ==========================================
    # PRELIMINARY PAGES: TABLE OF CONTENTS
    # ==========================================
    story.append(Paragraph("TABLE OF CONTENTS", h1_style))
    story.append(Spacer(1, 10))
    toc_data = [
        ["DECLARATION", "ii"],
        ["ACKNOWLEDGEMENT", "iii"],
        ["ABSTRACT", "iv"],
        ["DEFINITION OF KEY TERMS", "vi"],
        ["ABBREVIATIONS AND ACRONYMS", "vii"],
        ["LIST OF FIGURES", "viii"],
        ["LIST OF TABLES", "viii"],
        ["CHAPTER ONE: PROJECT WORKPLAN", "1"],
        ["   1.1 Statement of Problem", "1"],
        ["   1.2 System Justification", "1"],
        ["   1.3 System Objectives", "2"],
        ["   1.4 Functional Requirements", "2"],
        ["   1.5 Breakdown of Tools & Resources", "3"],
        ["   1.6 Project Schedule Breakdown", "3"],
        ["CHAPTER TWO: DESIGN AND MODELING", "4"],
        ["   2.1 Introduction", "4"],
        ["   2.2 Logical Designs (Flowcharts & UML)", "4"],
        ["   2.3 User Interface Models (Wireframes & Screen Inventory)", "6"],
        ["CHAPTER THREE: SYSTEM IMPLEMENTATION & TESTING", "8"],
        ["   3.1 Introduction", "8"],
        ["   3.2 Relational Database Schema & Implementation Details", "8"],
        ["   3.3 Project Testing & Verification", "9"],
        ["   3.4 Project Deployment Guide", "10"],
        ["CHAPTER FOUR: CONCLUSION & RECOMMENDATION", "11"],
        ["   4.1 Conclusion", "11"],
        ["   4.2 Recommendations", "11"],
        ["REFERENCES (APA 7)", "12"]
    ]
    t_toc = Table(toc_data, colWidths=[400, 80])
    t_toc.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # ==========================================
    # PRELIMINARY PAGES: DEFINITIONS, ABBREVIATIONS, FIGURES, TABLES
    # ==========================================
    story.append(Paragraph("DEFINITION OF KEY TERMS", h1_style))
    terms = [
        ("android", "An open-source operating system platform for mobile devices on which the client applications run."),
        ("api", "Application Programming Interface — a set of rules allowing different software applications to communicate with each other."),
        ("backend", "The data access and logic layer of the application, running on a remote web server (implemented in Django)."),
        ("database", "An organized collection of structured data stored persistently (implemented via SQLite/MySQL in this project)."),
        ("frontend", "The client-facing visual interface of the application that users directly interact with (built using React)."),
        ("biocontrol", "Biological pest control using natural predators, beneficial insects (Koppert), or microorganisms to suppress pests."),
        ("telemetry", "Automatic recording and transmission of soil parameters (moisture, pH, NPK) from sensors/simulations to the database.")
    ]
    for term, definition in terms:
        story.append(Paragraph(f"<b>{term}</b> — {definition}", body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("ABBREVIATIONS AND ACRONYMS", h1_style))
    abbrevs = [
        ("API", "Application Programming Interface"),
        ("DRF", "Django Rest Framework"),
        ("ERD", "Entity Relationship Diagram"),
        ("JWT", "JSON Web Token (used for user authentication)"),
        ("KALRO", "Kenya Agricultural and Livestock Research Organization"),
        ("PCPB", "Pest Control Products Board of Kenya"),
        ("UML", "Unified Modeling Language"),
        ("UI", "User Interface")
    ]
    for ab, full in abbrevs:
        story.append(Paragraph(f"<b>{ab}</b> — {full}", body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("LIST OF FIGURES", h1_style))
    figures = [
        "Fig 2.2.1: Use Case Diagram for User & System Roles",
        "Fig 2.2.2: Entity Relationship Diagram (ERD)",
        "Fig 2.2.3: System Components Class Diagram",
        "Fig 2.2.4: Authentication Process Flowchart",
        "Fig 2.2.5: Dashboard & Weather Forecast Flowchart",
        "Fig 2.2.6: Pest Alerts & Soil Health Flowchart",
        "Fig 2.2.7: Market Insights & Farmer Network Flowchart",
        "Fig 2.2.8: Agronomist Chat & Settings Flowchart",
        "Fig 2.3.1: Application Main Dashboard View"
    ]
    for fig in figures:
        story.append(Paragraph(fig, body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("LIST OF TABLES", h1_style))
    tables_list = [
        "Table 1.4: Functional Requirements Specifications",
        "Table 1.5: Tools and Resources Breakdown",
        "Table 1.6: Project Gantt Schedule Breakdown",
        "Table 2.3: Screen Inventory Specifications",
        "Table 3.3: System Integration Testing Log"
    ]
    for tab in tables_list:
        story.append(Paragraph(tab, body_style))
    story.append(PageBreak())

    # ==========================================
    # CHAPTER ONE: PROJECT WORKPLAN
    # ==========================================
    story.append(Paragraph("CHAPTER ONE: PROJECT WORKPLAN", h1_style))
    story.append(Paragraph("1.1 Statement of Problem", h2_style))
    p1 = """
    Kenyan smallholder farmers lack timely, localized, and actionable agricultural advisory services to cope with climate variability,
    rapid soil degradation, pest outbreaks, and market risks. While national policies and general frameworks exist, they do not sufficiently
    bridge the gap between scientific/meteorological knowledge and farmer-level micro-decision-making.
    There is a critical social need for this study because food insecurity, poverty, and rural vulnerability are escalating in the face of climate change.
    Farmers are unable to make informed decisions about crop selection, optimal planting windows, localized soil nutrient amendment,
    or targeted pest management. Existing intervention systems are fragmented, providing only siloed weather forecasts or static crop bulletins, and lack
    integration of real-time telemetry, mapping tools, private extension communication channels, and offline accessibility. This study therefore
    investigates how an integrated, localized, and offline-capable Climate-Smart Farming Advisory System can fill this operational gap.
    """
    story.append(Paragraph(p1, body_style))

    story.append(Paragraph("1.2 System Justification", h2_style))
    p2 = """
    The Climate-Smart Farming Advisory System (GreenAcres) is important because it directly addresses the challenges faced by Kenyan smallholder farmers,
    who produce nearly 75% of the country's food but remain highly vulnerable to climate shocks. The system bridges existing gaps by combining
    weather forecasts, real-time soil NPK diagnostics, illustrated pest alerts (utilizing PCPB chemical and Koppert biocontrol databases),
    and commodity market price indices into one unified platform.<br/><br/>
    By implementing modern features such as the Mapbox API for location searching, offline persistence for remote farms, and a private agronomist chat console,
    the application empowers farmers to receive immediate, tailored instructions. The system supports Kenya's Vision 2030 and the Kenya Climate Smart Agriculture Strategy,
    contributing to food security, environmental stewardship, and poverty reduction.
    """
    story.append(Paragraph(p2, body_style))

    story.append(Paragraph("1.3 System Objectives", h2_style))
    story.append(Paragraph("1.3.1 General Objective", h3_style))
    story.append(Paragraph("To design, develop, and test a Climate-Smart Farming Advisory System that enhances resilience, improves agricultural productivity, and strengthens food security among Kenyan smallholder farmers.", body_style))
    
    story.append(Paragraph("1.3.2 Specific Objectives", h3_style))
    story.append(Paragraph("1. Deliver timely, county-specific weather forecasts and localized planting window recommendations.", list_style))
    story.append(Paragraph("2. Provide interactive soil telemetry metrics (Moisture, pH, NPK) with immediate fertilizer and soil stewardship tips.", list_style))
    story.append(Paragraph("3. Set up an illustrated Pest Alerts bulletin featuring both PCPB approved chemicals and Koppert biological controls.", list_style))
    story.append(Paragraph("4. Integrate a Mapbox-driven land location finder and a local Farmer Network Business Directory with offline capabilities.", list_style))
    story.append(Paragraph("5. Provide a secure, private agronomist chat platform for direct farmer-to-expert consultation.", list_style))

    story.append(Paragraph("1.4 Functional Requirements", h2_style))
    req_data = [
        ["User Role", "System Function / Activity"],
        ["Farmer", "Register/Login, Search locations via Mapbox, View localized soil & weather reports, View pest/weed advisories, Register business profile in Directory, Chat with Agronomist, Switch languages (11 Kenyan languages) & themes."],
        ["Agronomist", "Log in as Admin, Override soil diagnostics metrics, Override crop trading prices, Publish new Pest/Weed advisories, Answer farmer private messages."],
        ["ICT Admin", "Database CRUD operations, manage users, maintain application build files, monitor server logs."],
        ["System", "Manage JWT token session state, auto-sync data to localStorage, parse user sectors to extract county-level details, fallback to Nominatim geocoding."]
    ]
    t_req = Table(req_data, colWidths=[100, 380])
    t_req.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B5E20")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D3D8CA")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_req)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.5 Breakdown of Tools & Resources", h2_style))
    tools_data = [
        ["Tool / Resource", "Technology Stack", "Application / Purpose"],
        ["Frontend", "React.js, Vite, Vanilla CSS", "Renders the user interface, sidebar, tabs, and dashboard layout."],
        ["Backend REST API", "Python, Django REST Framework", "Handles user authentication, profile updates, and telemetry persistence."],
        ["Database Engine", "SQLite / MySQL", "Stores persistent data (messages, user profiles, soil metrics, pest alerts)."],
        ["Maps & Location", "Mapbox Geocoding API, Leaflet", "Geocodes search queries and places markers on the farm layout map."],
        ["Data Sources", "KALRO & PCPB datasets", "Fills the weed/pest database with approved products and biological controls."]
    ]
    t_tools = Table(tools_data, colWidths=[100, 150, 230])
    t_tools.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B5E20")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D3D8CA")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_tools)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.6 Project Schedule Breakdown", h2_style))
    sched_data = [
        ["Milestone / Activity", "Start Week", "End Week", "Deliverables"],
        ["Milestone 1: Project Plan & Analysis", "Week 1", "Week 3", "System proposal, problem statement, tools selection."],
        ["Milestone 2: System Design & Modeling", "Week 4", "Week 5", "UML, ERD diagrams, Login flowchart, UI Mockups."],
        ["Milestone 3: Database & Auth Setup", "Week 6", "Week 7", "Django model structure, JWT token endpoint, SignupPage."],
        ["Milestone 4: Core Features Development", "Week 8", "Week 10", "Weather, Soil, Pest, Mapbox, Chat, & Directory Tab."],
        ["Milestone 5: System Testing & Deployment", "Week 11", "Week 11", "Integration tests log, dev environment build verification."],
        ["Milestone 6: Final Documentation", "Week 12", "Week 12", "Final compiled PDF documentation with supervisor review."]
    ]
    t_sched = Table(sched_data, colWidths=[130, 60, 60, 230])
    t_sched.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B5E20")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D3D8CA")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_sched)
    story.append(PageBreak())

    # ==========================================
    # CHAPTER TWO: DESIGN AND MODELING
    # ==========================================
    story.append(Paragraph("CHAPTER TWO: DESIGN AND MODELING", h1_style))
    story.append(Paragraph("2.1 Introduction", h2_style))
    intro_ch2 = """
    This chapter describes the logical models and user interface mockups prepared for the Climate-Smart Farming Advisory System.
    The goal is to establish structural blueprints (using UML Class, Sequence, and Use Case diagrams), database design mapping
    (Entity Relationship Diagram), and workflow logic (Flowcharts) to guide implementation in Chapter Three.
    """
    story.append(Paragraph(intro_ch2, body_style))

    story.append(Paragraph("2.2 Logical Designs", h2_style))
    
    # 1. Use Case Diagram
    story.append(Paragraph("2.2.1 System Use Case Diagram", h3_style))
    story.append(create_usecase_diagram())
    story.append(Paragraph("<i>Fig 2.2.1: Use Case Diagram for User & System Roles</i>", quote_style))
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # 2. ERD Diagram
    story.append(Paragraph("2.2.2 Entity Relationship Diagram (ERD)", h3_style))
    story.append(create_erd_diagram())
    story.append(Paragraph("<i>Fig 2.2.2: Entity Relationship Diagram (ERD)</i>", quote_style))
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # 3. Class Diagram
    story.append(Paragraph("2.2.3 System Components Class Diagram", h3_style))
    story.append(create_class_diagram())
    story.append(Paragraph("<i>Fig 2.2.3: System Components Class Diagram</i>", quote_style))
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # 4. Process Flowcharts
    story.append(Paragraph("2.2.4 System Process Flowcharts", h3_style))
    
    # Auth Flowchart
    story.append(Paragraph("<b>A. User Authentication Flow (Log In &amp; Sign Up)</b>", body_style))
    story.append(Image("docs/auth_flow.png", width=360, height=390))
    story.append(Paragraph("<i>Fig 2.2.4: Authentication Process Flowchart</i>", quote_style))
    story.append(PageBreak())

    # Weather/Dashboard Flowchart
    story.append(Paragraph("<b>B. Dashboard &amp; Weather Forecasting Flow</b>", body_style))
    story.append(Image("docs/weather_dashboard_flow.png", width=360, height=390))
    story.append(Paragraph("<i>Fig 2.2.5: Dashboard &amp; Weather Forecast Flowchart</i>", quote_style))
    story.append(PageBreak())

    # Pests/Soil Flowchart
    story.append(Paragraph("<b>C. Pest Alerts &amp; Soil Health Monitoring Flow</b>", body_style))
    story.append(Image("docs/pests_soil_flow.png", width=360, height=348))
    story.append(Paragraph("<i>Fig 2.2.6: Pest Alerts &amp; Soil Health Flowchart</i>", quote_style))
    story.append(PageBreak())

    # Market/Network Flowchart
    story.append(Paragraph("<b>D. Market Insights &amp; Farmer Network Feed Flow</b>", body_style))
    story.append(Image("docs/market_network_flow.png", width=360, height=348))
    story.append(Paragraph("<i>Fig 2.2.7: Market Insights &amp; Farmer Network Flowchart</i>", quote_style))
    story.append(PageBreak())

    # Chat/Settings Flowchart
    story.append(Paragraph("<b>E. Agronomist Consultation Chat &amp; Settings Flow</b>", body_style))
    story.append(Image("docs/chat_settings_flow.png", width=360, height=348))
    story.append(Paragraph("<i>Fig 2.2.8: Agronomist Chat &amp; Settings Flowchart</i>", quote_style))
    story.append(Spacer(1, 10))
    story.append(PageBreak())

    # 5. Screen Inventory
    story.append(Paragraph("2.3 User Interface Models", h2_style))
    story.append(Paragraph("2.3.1 Screen Inventory Specs", h3_style))
    scr_data = [
        ["Screen Name", "Description / Purpose", "Accessed By"],
        ["Login / Signup Page", "Authenticate user credentials, collect county/crop preferences.", "All visitors"],
        ["Dashboard Page", "Dynamic weather outlook, soil indicators, active pest count, crop prices.", "Farmers & Admins"],
        ["Lands Map Tab", "Mapbox geocoding interface to pin field coordinates.", "Farmers & Admins"],
        ["Soil Health Tab", "Displays NPK measurements, pH values, and KALRO soil health tips.", "Farmers & Admins"],
        ["Pest Alerts Tab", "Lists active pest warnings. Includes the 13-pest interactive library.", "Farmers & Admins"],
        ["Farmer Network Tab", "Farmer Business Directory showing contacts, produce, and location.", "Farmers & Admins"],
        ["Agro. Chat Tab", "Private 1-to-1 secure chat consults with Dr. Samuel Njuguna.", "Farmers & Admins"],
        ["Admin Console", "Override weather, soil values, commodity prices, and publish pest alerts.", "Admin / Agronomist"]
    ]
    t_scr = Table(scr_data, colWidths=[100, 260, 120])
    t_scr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B5E20")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D3D8CA")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_scr)
    story.append(Spacer(1, 15))

    # Actual Screenshots / Visual Guides
    story.append(Paragraph("2.3.2 Main Dashboard Interface", h3_style))
    dash_img_path = "climate_smart_react/src/assets/dashboard-ref.png"
    if os.path.exists(dash_img_path):
        story.append(Image(dash_img_path, width=440, height=200))
        story.append(Paragraph("<i>Fig 2.3.1: Application Main Dashboard View</i>", quote_style))
    else:
        story.append(Paragraph("[Dashboard Interface Reference Image Not Found — Replaced by central mockup layout]", quote_style))
    story.append(PageBreak())

    # ==========================================
    # CHAPTER THREE: SYSTEM IMPLEMENTATION & TESTING
    # ==========================================
    story.append(Paragraph("CHAPTER THREE: SYSTEM IMPLEMENTATION & TESTING", h1_style))
    story.append(Paragraph("3.1 Introduction", h2_style))
    intro_ch3 = """
    This chapter presents the actual implementation details of the Climate-Smart Farming Advisory System.
    It lists database models, API endpoint structures, and details the implementation of core features
    such as Mapbox Geocoding, the Farmer Directory persistence, private Agronomist Chat rooms, and multi-language support.
    It also catalogs the testing logs verifying feature correctness.
    """
    story.append(Paragraph(intro_ch3, body_style))

    story.append(Paragraph("3.2 Database Schema & Models", h2_style))
    db_desc = """
    The backend uses a relational database structure. Below are the primary Django models defined in <code>models.py</code>:<br/><br/>
    <b>1. CustomUser:</b> Inherits from AbstractUser. Extends profiles with <code>sector</code> (formatted as <i>County - Sub-county (Crop)</i>), <code>phone_number</code>, and <code>profile_picture</code>.<br/>
    <b>2. SoilMetric:</b> Unique sector string index, moisture percentage (Integer), pH level (Float), Nitrogen, Phosphorus, Potassium (NPK - Integers), and <code>tips</code> (Text).<br/>
    <b>3. PestAlert:</b> Title (String), risk_level (Enum: Low/Medium/High), target sector (String), description (Text), mitigation recommendations (Text), and <code>pestKey</code> (identifier).<br/>
    <b>4. Message:</b> Sender (FK to CustomUser), recipient (FK to CustomUser), subject (String), message text (Text), and <code>reply</code> text (Text, nullable).<br/>
    <b>5. BusinessProfile:</b> FK to CustomUser, contact phone, produce categories, and regional location string.
    """
    story.append(Paragraph(db_desc, body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.3 Core Feature Implementation Details", h2_style))
    
    story.append(Paragraph("3.3.1 Dynamic Region-County Synchronization", h3_style))
    f1_desc = """
    To prevent arbitrary sector entries, a central utility maps the 8 regions of Kenya to their 47 counties.
    During signup and profile editing, selecting a region triggers an immediate update hook to populate the County selector
    with corresponding counties (e.g. Central Region selects Kiambu, Nyeri, etc.). When submitted, the system combines county, sub-county,
    and crop selectors into a standardized string: <i>County - Sub-county (Crop)</i>.
    """
    story.append(Paragraph(f1_desc, body_style))

    story.append(Paragraph("3.3.2 Mapbox Geocoding API & Leaflet Integration", h3_style))
    f2_desc = """
    The search bar in the Lands Map query feeds directly into the Mapbox Places Geocoding endpoint using a user-configured token.
    If the Mapbox query succeeds, the map centers on the returned coordinates.
    To ensure usability under API failures or missing tokens, a robust fallback automatically redirects queries to OpenStreetMap's Nominatim engine.
    """
    story.append(Paragraph(f2_desc, body_style))

    story.append(Paragraph("3.3.3 Biocontrol Advisories & Illustrated Pest Library", h3_style))
    f3_desc = """
    The Pest Alerts tab features high-quality macro photography for 13 insect types. Each pest profile includes the specific crops attacked,
    movement patterns, lifecycle details, and field signs. The treatment guidelines are split between PCPB chemical treatments and Koppert biological controls
    (such as predatory mites and parasitoids), allowing sustainable crop protection.
    """
    story.append(Paragraph(f3_desc, body_style))

    story.append(Paragraph("3.3.4 Secure Consultation Chat & Farmer Directory Sync", h3_style))
    f4_desc = """
    The Agronomist Chat Tab allows secure consultations. Chat logs and business profile directories are stored in the client's <code>localStorage</code>,
    meaning they can be viewed and added offline, sync-saving to the server as soon as connection is re-established.
    """
    story.append(Paragraph(f4_desc, body_style))
    story.append(PageBreak())

    story.append(Paragraph("3.4 Project Testing & Verification", h2_style))
    test_data = [
        ["Test ID", "Description", "Inputs / Actions", "Expected Result", "Status"],
        ["TC-001", "User JWT Authentication", "Login with valid farmer profile credentials", "JWT Token returned, redirect to dashboard", "PASS"],
        ["TC-002", "Region Dropdown Sync", "Change Region from 'Central' to 'Western'", "County options update to Bungoma, Busia, etc.", "PASS"],
        ["TC-003", "Mapbox Geocoding Search", "Search 'Naivasha' with Mapbox token", "Map centers on coordinates with pin placed", "PASS"],
        ["TC-004", "Offline Directory Persistence", "Add business profile while offline", "Data cached in localStorage; renders in UI", "PASS"],
        ["TC-005", "Pest Library Load", "Open Pest Alerts Tab and select a pest", "Pest profile displays symptoms & Koppert remedies", "PASS"],
        ["TC-006", "Admin Telemetry Override", "Submit soil telemetry overrides", "DB updates metrics; changes reflect on dashboard", "PASS"]
    ]
    t_test = Table(test_data, colWidths=[55, 110, 110, 160, 45])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B5E20")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D3D8CA")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_test)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.5 Project Deployment Guide", h2_style))
    dep_text = """
    Follow these steps to deploy and run the environment locally:<br/><br/>
    <b>1. Django REST Backend Setup:</b><br/>
    - Navigate to <code>/climate_smart_backend</code>.<br/>
    - Run migrations: <code>python manage.py migrate</code>.<br/>
    - Launch the server: <code>python manage.py runserver</code> (serves REST endpoints at port 8000).<br/><br/>
    <b>2. React Frontend Setup:</b><br/>
    - Navigate to <code>/climate_smart_react</code>.<br/>
    - Start the dev environment: <code>npm run dev-vite</code> (runs the local server on http://localhost:5173).<br/><br/>
    <b>3. Build Production Target:</b><br/>
    - Run <code>npm run build</code> in the react folder to output compiled production assets.
    """
    story.append(Paragraph(dep_text, body_style))
    story.append(PageBreak())

    # ==========================================
    # CHAPTER FOUR: CONCLUSION AND RECOMMENDATION
    # ==========================================
    story.append(Paragraph("CHAPTER FOUR: CONCLUSION AND RECOMMENDATION", h1_style))
    story.append(Paragraph("4.1 Conclusion", h2_style))
    p_concl = """
    The development of the Climate-Smart Farming Advisory System successfully implements all milestones outlined in the project supervision form.
    By integrating dynamic region/county selectors, Mapbox location services, a comprehensive biological and chemical pest control center,
    a secure consultant chat, and a local business directory, the system addresses the main research objectives.
    The app is fully offline-capable and supports 11 local Kenyan languages. System testing proves that the integration of the React/Vite frontend
    and Django rest endpoints functions correctly and remains reliable in simulated scenarios.
    """
    story.append(Paragraph(p_concl, body_style))

    story.append(Paragraph("4.2 Recommendations", h2_style))
    p_recom = """
    For future expansion of the advisory platform, the following upgrades are recommended:<br/><br/>
    <b>1. Mobile Payment Integration:</b> Implement M-PESA API endpoints to support direct purchasing of organic biological controls (Koppert products) from local distributors.<br/>
    <b>2. Satellite Crop Health Analysis:</b> Integrate Sentinel-2 satellite feeds to let farmers check NDVI indicators directly on the Lands Map tab.<br/>
    <b>3. Machine Learning Diagnosis:</b> Add image recognition models to automatically identify pests and suggest KALRO/PCPB drugs from a uploaded photo.<br/>
    <b>4. SMS Notification integration:</b> Connect Africa's Talking SMS gateway to broadcast severe local pest and weather alerts.
    """
    story.append(Paragraph(p_recom, body_style))
    story.append(Spacer(1, 15))

    # ==========================================
    # REFERENCES
    # ==========================================
    story.append(Paragraph("REFERENCES (APA 7)", h1_style))
    refs = [
        "Kenya Agricultural and Livestock Research Organization [KALRO]. (2023). <i>Climate-smart agricultural practices for smallholder farmers in Kenya</i>. KALRO Publications.",
        "Koppert Kenya. (2024). <i>Biological pest control and sustainable farming solutions: Guides for plant pests identification</i>. https://www.koppert.co.ke/plant-pests/",
        "Mapbox. (2025). <i>Mapbox Geocoding API Search Documentation</i>. https://docs.mapbox.com/api/search/geocoding/",
        "Pest Control Products Board [PCPB] Kenya. (2024). <i>List of registered pest control products for crop protection in Kenya</i>. Ministry of Agriculture.",
        "Zetech University. (2025). <i>ICT Diploma project guidelines and project supervision requirements</i>. Department of Computer Science."
    ]
    for ref in refs:
        story.append(Paragraph(ref, list_style))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    output_path = "Climate_Smart_Farming_System_Documentation.pdf"
    if len(sys.argv) > 1:
        output_path = sys.argv[1]
    
    print(f"Generating PDF at {output_path}...")
    build_pdf(output_path)
    print("PDF Generated successfully!")
