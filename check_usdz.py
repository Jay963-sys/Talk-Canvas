import sys, zipfile, struct
fn = sys.argv[1]
data = open(fn, "rb").read()
for zi in zipfile.ZipFile(fn).infolist():
    ho = zi.header_offset
    nl = struct.unpack("<H", data[ho+26:ho+28])[0]
    el = struct.unpack("<H", data[ho+28:ho+30])[0]
    off = ho + 30 + nl + el
    print(zi.filename, "compress", zi.compress_type, "data_off", off, "aligned64", off % 64 == 0)