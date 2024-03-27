import json
import sys

if len(sys.argv) != 3:
    print('Usage: program.py [options_file.json] [content_script.js]')
    sys.exit(1)

optionsFile, contentScript = sys.argv[1:]

with open(optionsFile) as file:
    jsonData = json.load(file)['filterData']

outStr = 'const filterData = {'

filterData = {
        'channelId': jsonData['channelId'],
        'channelName': jsonData['channelName'],
        'videoTitle': jsonData['title']
    }

def formatFilter(filter):
    if len(filter) == 0:
        return
    if filter.startswith('//'):
        return
    if not (filter.startswith('/') and filter.endswith('/')):
        return f'\'{filter}\'' 
    return filter

def indexOf(array, elem):
    try:
        return array.index(elem)
    except ValueError:
        print(f'Missing {repr(elem)} in {contentScript}')
        sys.exit(1)


for key, value in filterData.items():
    value = filter(lambda x: x is not None, list(map(formatFilter, value)))
    outStr += f'{key}:[{",".join(value)}],'

outStr = outStr[:-1] + '}'

with open(contentScript) as file:
    lines = file.readlines()

startMarker = indexOf(lines, '// FILTERS START\n')
endMarker = indexOf(lines, '// FILTERS END\n')

if endMarker < startMarker:
    print(f'Invalid markers in "{contentScript}"')
    sys.exit(1)

del lines[startMarker+1:endMarker]

lines.insert(startMarker+1, outStr + '\n')

with open(contentScript, 'w') as file:
    file.writelines(lines)
