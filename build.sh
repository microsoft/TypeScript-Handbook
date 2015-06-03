mkdir output
pandoc -f markdown_github-hard_line_breaks -t html5 --toc --self-contained pages/*.md > output/handbook.html
