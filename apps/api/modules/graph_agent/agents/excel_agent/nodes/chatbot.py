from io import StringIO

import pandas as pd
from api.core.config import settings
from langchain_core.runnables import RunnableConfig
from langchain_deepseek import ChatDeepSeek

from ..state import State


class ChatBotNode:
    def __init__(self):
        self.llm = ChatDeepSeek(
            api_base=f"{settings.LLM_HOST}/v1",
            api_key=settings.LLM_SECRET,
            model="deepseek-coder:latest",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )
        self.llm_with_tools = self.llm.bind_tools(tools=[])

    def __call__(self, state: State, config: RunnableConfig):
        dataframe = pd.read_json(StringIO(state["dataframe"]), orient="split")

        df_describe = dataframe.describe()

        response = self.llm_with_tools.invoke(
            [
                {
                    "role": "system",
                    "content": f"""
                    You are a Data Analyst and a Data Scientist, who can find meaningful insights based on the data the user has provided

                    Below is sample of the first 5 rows of the Pandas dataframe for you to analyze
                    <data_frame>
                    {dataframe.head(5).to_markdown()}
                    </data_frame>

                    Below is the descriptive statistics summarizing the central tendency, dispersion, and shape of a dataset's distribution
                    <data_frame_describe>
                    {df_describe.to_markdown()}
                    </data_frame_describe>

                    Analyze the data and give key insight on it based on the user query.

                    Also generate Python Code with pandas for analysis if required.
                    Use the PyodideSandboxTool to execute Python code when necessary
                    """,
                },
                *state["messages"],
            ]
        )

        return {"messages": [response]}
