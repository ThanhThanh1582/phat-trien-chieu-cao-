html_path = "C:/Users/USER/.gemini/antigravity/scratch/nova-hospital-slides/index.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# We replace cards deck block on Slide 2.4 to add draggable="true" and update the caption text
old_deck = """            <div class="cards-deck" id="cards-deck-l2">
              <!-- Dinh dưỡng -->
              <div class="l2-habit-card" data-good="false" data-id="h1">🥩 Ăn ít chất đạm</div>
              <div class="l2-habit-card" data-good="false" data-id="h2">🍳 Thường xuyên bỏ bữa sáng</div>
              <div class="l2-habit-card" data-good="false" data-id="h3">🍿 Ăn vặt nhiều snack ngọt</div>
              <div class="l2-habit-card" data-good="false" data-id="h4">🥤 Uống nước ngọt thường xuyên</div>
              
              <!-- Giấc ngủ -->
              <div class="l2-habit-card" data-good="false" data-id="h5">🌙 Đi ngủ muộn sau 23h</div>
              <div class="l2-habit-card" data-good="false" data-id="h6">📱 Lướt điện thoại trước khi ngủ</div>
              <div class="l2-habit-card" data-good="true" data-id="h7">💤 Đi ngủ sớm, ngủ đủ 8 tiếng</div>
              <div class="l2-habit-card" data-good="true" data-id="h8">🛌 Ngủ sớm trước 22h tối</div>
              
              <!-- Vận động -->
              <div class="l2-habit-card" data-good="true" data-id="h9">⚽ Chăm chỉ chơi thể thao</div>
              <div class="l2-habit-card" data-good="false" data-id="h10">🪑 Ngồi nhiều một chỗ lười đi</div>
              <div class="l2-habit-card" data-good="false" data-id="h11">🎮 Cả ngày chỉ nằm chơi game</div>
              <div class="l2-habit-card" data-good="true" data-id="h12">🚶 Tích cực đi bộ mỗi ngày</div>
            </div>"""

new_deck = """            <div class="cards-deck" id="cards-deck-l2">
              <!-- Dinh dưỡng -->
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h1">🥩 Ăn ít chất đạm</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h2">🍳 Thường xuyên bỏ bữa sáng</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h3">🍿 Ăn vặt nhiều snack ngọt</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h4">🥤 Uống nước ngọt thường xuyên</div>
              
              <!-- Giấc ngủ -->
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h5">🌙 Đi ngủ muộn sau 23h</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h6">📱 Lướt điện thoại trước khi ngủ</div>
              <div class="l2-habit-card" draggable="true" data-good="true" data-id="h7">💤 Đi ngủ sớm, ngủ đủ 8 tiếng</div>
              <div class="l2-habit-card" draggable="true" data-good="true" data-id="h8">🛌 Ngủ sớm trước 22h tối</div>
              
              <!-- Vận động -->
              <div class="l2-habit-card" draggable="true" data-good="true" data-id="h9">⚽ Chăm chỉ chơi thể thao</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h10">🪑 Ngồi nhiều một chỗ lười đi</div>
              <div class="l2-habit-card" draggable="true" data-good="false" data-id="h11">🎮 Cả ngày chỉ nằm chơi game</div>
              <div class="l2-habit-card" draggable="true" data-good="true" data-id="h12">🚶 Tích cực đi bộ mỗi ngày</div>
            </div>"""

old_caption = '<p class="body-text-center">Click chọn thẻ thói quen để tự động bay vào đúng thư mục y khoa!</p>'
new_caption = '<p class="body-text-center">Kéo thả thẻ thói quen vào đúng thư mục y khoa (Hỗ trợ hoặc Cản trở)!</p>'

content = content.replace(old_caption, new_caption)
content = content.replace(old_deck.replace("\r\n", "\n"), new_deck)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Draggable cards updated successfully!")
