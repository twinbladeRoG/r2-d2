import json
import os
import threading
from collections import defaultdict
from pathlib import Path
from typing import List

import pandas as pd
from docling.datamodel.base_models import InputFormat
from docling.datamodel.document import ConversionResult
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableFormerMode
from docling.document_converter import DocumentConverter, PdfFormatOption

from api.logger import logger

from .schemas import (
    CPUUsage,
    DoclingExtractionResult,
    DocumentType,
    ExtractedDocument,
    UsageLog,
)
from .utils import monitor_usage


class DoclingExtractor:
    def _get_pdf_pipeline(self):
        pipeline_options = PdfPipelineOptions(do_table_structure=True)
        # uses text cells predicted from table structure model
        pipeline_options.table_structure_options.do_cell_matching = True
        # use more accurate TableFormer model
        pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE
        # pipeline_options.do_ocr = True
        # pipeline_options.ocr_options.force_full_page_ocr = True

    def _get_converter(self, pipeline: PdfPipelineOptions):
        return DocumentConverter(
            format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline)}
        )

    def run(self, file_path: str | Path):
        stop_event = threading.Event()
        usage_data = UsageLog(
            cpu_usage=CPUUsage(cpu_count=0, total_memory=0), gpu_usage=[]
        )

        # Start monitoring thread
        monitor_thread = threading.Thread(
            target=monitor_usage, args=(1, stop_event, usage_data)
        )
        monitor_thread.start()

        logger.info(f"Extracting document: {file_path}")
        result = self._extract(file_path)
        logger.info(f"Document extraction completed: {file_path}")

        # Stop monitoring
        stop_event.set()
        monitor_thread.join()

        return DoclingExtractionResult(usage_log=usage_data, documents=result)

    def _extract(self, file_path: str | Path):
        """Extract content from document"""

        pdf_pipeline = self._get_pdf_pipeline()
        converter = self._get_converter(pdf_pipeline)

        result = converter.convert(file_path)
        result_dict = result.document.export_to_dict()
        result_markdown = result.document.export_to_markdown()

        directory_path = os.path.realpath(__file__)
        path, _ = os.path.split(directory_path)
        output_dir = Path(path) / "test" / "outputs"
        output_dir.mkdir(parents=True, exist_ok=True)
        doc_filename = "output"

        # Export Deep Search document JSON format:
        with (output_dir / f"{doc_filename}.json").open("w", encoding="utf-8") as fp:
            fp.write(json.dumps(result_dict))

        # Export Markdown format:
        with (output_dir / f"{doc_filename}.md").open("w", encoding="utf-8") as fp:
            fp.write(result_markdown)

        texts = self._extract_text(result)
        tables = self._extract_df_tables(result)

        return texts + tables

    def _extract_df_tables(self, result: ConversionResult):
        """Uses the conversation result object to export the tables as pandas dataframe"""

        tables = []
        for table in result.document.tables:
            table_df: pd.DataFrame = table.export_to_dataframe()
            markdown_table = table_df.to_markdown()
            page_number = table.prov[0].page_no

            caption_refs = [caption.get_ref().cref for caption in table.captions]

            extractive_captions = []
            for caption_ref in caption_refs:
                text_id = caption_ref.split("/")[-1]
                try:
                    caption_text = result.document.texts[int(text_id)].text
                    extractive_captions.append(caption_text)
                except (ValueError, TypeError, IndexError) as e:
                    continue

            # join the extractive and generative captions
            caption = "\n".join(extractive_captions)
            markdown_table = f"{caption}\n{markdown_table}"

            doc = ExtractedDocument(
                text=markdown_table, page_number=page_number, type=DocumentType.TABLE
            )
            tables.append(doc)

        return tables

    def _extract_tables(self, result_dict: dict) -> list[ExtractedDocument]:
        """
        @deprecated -  Uses the result dictionary to extract tables
        """

        tables = []
        for table_obj in result_dict.get("tables", []):
            # convert the tables into markdown format
            markdown_table = self._parse_table(table_obj)
            caption_refs = [caption["$ref"] for caption in table_obj["captions"]]

            extractive_captions = []
            for caption_ref in caption_refs:
                text_id = caption_ref.split("/")[-1]
                try:
                    caption_text = result_dict["texts"][int(text_id)]["text"]
                    extractive_captions.append(caption_text)
                except (ValueError, TypeError, IndexError) as e:
                    continue
            # join the extractive and generative captions
            caption = "\n".join(extractive_captions)
            markdown_table = f"{caption}\n{markdown_table}"

            page_number = table_obj["prov"][0].get("page_no", 1)

            doc = ExtractedDocument(
                text=markdown_table, page_number=page_number, type=DocumentType.TABLE
            )
            tables.append(doc)

        return tables

    def _extract_text(self, result: ConversionResult) -> list[ExtractedDocument]:
        texts = []
        page_number_to_text = defaultdict(list)

        for text_obj in result.document.texts:
            page_number = text_obj.prov[0].page_no
            page_number_to_text[page_number].append(text_obj.text)

        for page_number, txts in page_number_to_text.items():
            doc = ExtractedDocument(
                text="\n".join(txts), page_number=page_number, type=DocumentType.TEXT
            )
            texts.append(doc)

        return texts

    def _extract_figures(self, result_dict: dict):
        figures = []
        gen_caption_count = 0

        for figure_obj in result_dict.get("pictures", []):
            continue

    def _parse_table(self, table_obj: dict) -> str:
        """Convert docling table object to markdown table"""
        table_as_list: List[List[str]] = []
        grid = table_obj["data"]["grid"]
        for row in grid:
            table_as_list.append([])
            for cell in row:
                table_as_list[-1].append(cell["text"])

        return self._make_markdown_table(table_as_list)

    def _make_markdown_table(self, table_as_list: List[List[str]]) -> str:
        """
        Convert table from python list representation to markdown format.
        The input list consists of rows of tables, the first row is the header.

        Args:
            table_as_list: list of table rows
                Example: [["Name", "Age", "Height"],
                        ["Jake", 20, 5'10],
                        ["Mary", 21, 5'7]]
        Returns:
            markdown representation of the table
        """
        markdown = "\n" + str("| ")

        for e in table_as_list[0]:
            to_add = " " + str(e) + str(" |")
            markdown += to_add
        markdown += "\n"

        markdown += "| "
        for i in range(len(table_as_list[0])):
            markdown += str("--- | ")
        markdown += "\n"

        for entry in table_as_list[1:]:
            markdown += str("| ")
            for e in entry:
                to_add = str(e) + str(" | ")
                markdown += to_add
            markdown += "\n"

        return markdown + "\n"
