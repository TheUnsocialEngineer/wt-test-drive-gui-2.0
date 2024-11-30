import json
import re
import sys
import json


def parse_blk(content):
    """
    Parse the BLK file content into a nested Python dictionary.
    """
    stack = [{}]  # Initialize the stack with an empty dictionary
    current_key = None

    # Regular expressions for identifying patterns in the BLK file
    key_value_pair = re.compile(r'(\w+):[tibpr]=(.+)')
    block_start = re.compile(r'(\w+){')
    block_end = re.compile(r'}')

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):  # Skip empty lines or comments
            continue

        # Match key-value pairs
        if key_value_pair.match(line):
            key, value = key_value_pair.match(line).groups()
            # Cast value based on its type
            if value.startswith('t="') or value.startswith('t='):  # String type
                value = value.strip('t=').strip('"')
            elif value.startswith('i='):  # Integer type
                value = int(value[2:])
            elif value.startswith('r='):  # Float type
                value = float(value[2:])
            elif value.startswith('b='):  # Boolean type
                value = value[2:].lower() == 'yes'
            elif value.startswith('p2='):  # Point type
                value = tuple(map(float, value[3:].split(',')))

            # Add the parsed key-value pair to the current dictionary
            stack[-1][key] = value

        # Match the start of a new block
        elif block_start.match(line):
            block_name = block_start.match(line).groups()[0]
            new_block = {}
            if block_name in stack[-1]:
                if isinstance(stack[-1][block_name], list):
                    stack[-1][block_name].append(new_block)
                else:
                    stack[-1][block_name] = [stack[-1][block_name], new_block]
            else:
                stack[-1][block_name] = new_block
            stack.append(new_block)

        # Match the end of a block
        elif block_end.match(line):
            stack.pop()

    return stack[0] if stack else {}


def blk_to_json(blk_file_path):
    """
    Convert BLK file content to JSON data and return it.
    """
    with open(blk_file_path, 'r', encoding='utf-8') as blk_file:
        blk_content = blk_file.read()

    # Parse the BLK content
    parsed_data = parse_blk(blk_content)

    return parsed_data
if __name__ == "__main__":
    # Ensure that the script only runs with a provided argument (file path)
    if len(sys.argv) > 1:
        blk_file_path = sys.argv[1]  # Get the file path from the argument

        # Convert BLK to JSON and get the parsed data
        json_data = blk_to_json(blk_file_path)

        # Print the resulting JSON data
        print(json.dumps(json_data, indent=4))
    else:
        print("No file path provided. Please provide a BLK file path.")
