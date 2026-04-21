import fitz  # PyMuPDF
from docx import Document


def extract_text_from_file(file_path: str, ext: str) -> str:
    """
    Extract plain text from PDF or DOCX.
    Returns the full text as a single string.
    Time complexity: O(n) where n = number of pages/paragraphs
    """
    if ext == ".pdf":
        return _extract_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _extract_docx(file_path)
    return ""


def _extract_pdf(path: str) -> str:
    """
    PyMuPDF — fastest Python PDF parser.
    Extracts all text blocks preserving logical reading order.
    """
    text_parts = []
    with fitz.open(path) as doc:
        for page in doc:
            # Use 'text' mode for clean extraction (no layout noise)
            text_parts.append(page.get_text("text"))
    return "\n".join(text_parts)


def _extract_docx(path: str) -> str:
    """
    python-docx — extract paragraphs and table cells.
    Tables often contain skills/experience grids.
    """
    doc = Document(path)
    parts = []

    # Paragraphs
    for para in doc.paragraphs:
        if para.text.strip():
            parts.append(para.text.strip())

    # Tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    parts.append(cell.text.strip())

    return "\n".join(parts)
