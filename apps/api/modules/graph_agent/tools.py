from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.messages import ToolMessage

tool = DuckDuckGoSearchResults(output_format="json")

tool_map = {"duckduckgo_results_json": "DuckDuckGo Web Search"}

tool_icon_map = {"duckduckgo_results_json": "mdi:search-web"}


def get_tool_label(value: str):
    label = tool_map.get(value, value)
    return label


def get_tool_icon(value: str):
    icon = tool_icon_map.get(value, "mdi:tools")
    return icon


class BasicToolNode:
    """A node that runs the tools requested in the last AIMessage."""

    def __init__(self, tools: list) -> None:
        self.tools_by_name = {tool.name: tool for tool in tools}

    def __call__(self, inputs: dict):
        if messages := inputs.get("messages", []):
            message = messages[-1]
        else:
            raise ValueError("No message found in input")
        outputs = []
        for tool_call in message.tool_calls:
            tool_result = self.tools_by_name[tool_call["name"]].invoke(
                tool_call["args"]
            )

            outputs.append(
                ToolMessage(
                    content=tool_result,
                    name=tool_call["name"],
                    tool_call_id=tool_call["id"],
                )
            )
        return {"messages": outputs}


tools = [tool]

tool_node = BasicToolNode(tools=tools)
