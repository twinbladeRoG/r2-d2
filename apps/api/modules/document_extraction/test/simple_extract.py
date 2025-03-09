import json
import logging
import time
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    AcceleratorDevice,
    AcceleratorOptions,
    PdfPipelineOptions,
)
from docling.document_converter import DocumentConverter, PdfFormatOption

_log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

source = Path("./pdfs/ozo-5056563.pdf")  # document per local path or URL

# Docling Parse with EasyOCR

pipeline_options = PdfPipelineOptions()
pipeline_options.do_ocr = True
pipeline_options.do_table_structure = True
pipeline_options.table_structure_options.do_cell_matching = True
pipeline_options.ocr_options.lang = ["es"]
pipeline_options.accelerator_options = AcceleratorOptions(
    num_threads=4, device=AcceleratorDevice.AUTO
)

doc_converter = DocumentConverter(
    format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
)

start_time = time.time()
conv_result = doc_converter.convert(source)
end_time = time.time() - start_time


_log.info(f"Document converted in {end_time:.2f} seconds.")

## Export results
output_dir = Path("./outputs")
output_dir.mkdir(parents=True, exist_ok=True)
doc_filename = "output"

# Export Deep Search document JSON format:
with (output_dir / f"{doc_filename}.json").open("w", encoding="utf-8") as fp:
    fp.write(json.dumps(conv_result.document.export_to_dict()))

# Export Text format:
with (output_dir / f"{doc_filename}.txt").open("w", encoding="utf-8") as fp:
    fp.write(conv_result.document.export_to_text())

# Export Markdown format:
with (output_dir / f"{doc_filename}.md").open("w", encoding="utf-8") as fp:
    fp.write(conv_result.document.export_to_markdown())

# Export Document Tags format:
with (output_dir / f"{doc_filename}.doctags").open("w", encoding="utf-8") as fp:
    fp.write(conv_result.document.export_to_document_tokens())
