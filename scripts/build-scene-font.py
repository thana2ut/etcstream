"""Build local scene typography; requires fonttools only when regenerating this asset.

Keep Kart's Thai outlines and shaping tables. Fill only empty ASCII letter glyphs
from the bundled Geist source; neither original font is modified.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
fonts = root / "public" / "fonts"
thai = TTFont(fonts / "Kart-chinesestyle.ttf")
latin = TTFont(fonts / "geist-regular.ttf")
thai_map, latin_map = thai.getBestCmap(), latin.getBestCmap()
latin_set = latin.getGlyphSet()
scale = thai["head"].unitsPerEm / latin["head"].unitsPerEm
replaced = []
for code in list(range(65, 91)) + list(range(97, 123)):
    name, source = thai_map[code], latin_map[code]
    if thai["glyf"][name].numberOfContours != 0:
        continue
    recording = DecomposingRecordingPen(latin_set)
    latin_set[source].draw(recording)
    pen = TTGlyphPen(None)
    recording.replay(TransformPen(pen, (scale, 0, 0, scale, 0, 0)))
    thai["glyf"][name] = pen.glyph()
    width, bearing = latin["hmtx"][source]
    thai["hmtx"][name] = (round(width * scale), round(bearing * scale))
    replaced.append(chr(code))

# Give the combined asset its own family name; preserve source notices and tables.
names = {1: "Etcstream Scene Thai Latin", 2: "Regular", 3: "Etcstream Scene Thai Latin 1.0",
         4: "Etcstream Scene Thai Latin Regular", 6: "EtcstreamSceneThaiLatin-Regular",
         16: "Etcstream Scene Thai Latin", 17: "Regular"}
for entry in thai["name"].names:
    if entry.nameID in names:
        entry.string = names[entry.nameID].encode(entry.getEncoding())
thai.save(fonts / "scene-thai-latin.ttf")
print(f"Built scene-thai-latin.ttf: filled {len(replaced)} empty ASCII letters; Thai shaping tables preserved.")
