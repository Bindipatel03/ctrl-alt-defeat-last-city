# Last City pet artwork

Generated with the built-in `image_gen` tool for this project. Exact prompts are
recorded in [prompts.json](prompts.json). All five images are saved locally and
used by the hatch reel, egg catalogue, equipment slots, inventory and merge preview.

Each 1536×1024 image is a 3-column × 2-row portrait atlas. Read cells left-to-right,
top-to-bottom; the sixth cell is unused. CSS selects a cell without extra files.
Gold pets reuse their normal portrait with a gold tint, glow and GOLD label.

| File | Pet portraits in cell order |
| --- | --- |
| [ember.png](ember.png) | Ash Mouse, Camp Cat, Ember Fox, Flame Owl, Phoenix |
| [moss.png](moss.png) | Moss Snail, Depot Rabbit, Vine Frog, Forest Stag, Grove Spirit |
| [clockwork.png](clockwork.png) | Bolt Beetle, Gear Pup, Copper Crab, Mecha Wolf, Forge Dragon |
| [prism.png](prism.png) | Pixel Bug, Relay Bird, Neon Jelly, Prism Tiger, Quantum Dragon |
| [astral.png](astral.png) | Star Moth, Moon Cub, Comet Whale, Nova Lion, Cosmic Spirit |

The returned atlases have softly shaded portrait backgrounds. They are used as
portraits, not advertised as transparent cutouts. Original generated outputs are
also retained in the generator's default output directory.
