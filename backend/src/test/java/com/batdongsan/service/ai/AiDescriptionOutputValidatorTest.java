package com.batdongsan.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiDescriptionOutputValidatorTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AiDescriptionOutputValidator validator = new AiDescriptionOutputValidator(objectMapper);

    @Test
    void acceptsStructuredVietnameseDescriptionWithTwoParagraphs() throws Exception {
        String description = validDescription();

        assertEquals(description, validator.validate(objectMapper.writeValueAsString(
                java.util.Map.of("description", description))));
    }

    @Test
    void rejectsInvalidSchemaLengthAndParagraphCount() throws Exception {
        assertInvalid("not-json");
        assertInvalid("{\"description\":\"ngắn\",\"extra\":true}");
        assertInvalid(objectMapper.writeValueAsString(java.util.Map.of(
                "description", "Nội dung một đoạn ".repeat(40))));
    }

    @Test
    void rejectsHtmlMarkdownAndContactDetailsButAllowsLongPrice() throws Exception {
        assertInvalid(jsonWith("<strong>Nhà đẹp</strong> "));
        assertInvalid(jsonWith("Xem thêm tại https://example.com "));
        assertInvalid(jsonWith("Liên hệ 0901234567 để xem nhà. "));
        assertInvalid(jsonWith("Email seller@example.com. "));
        assertInvalid(jsonWith("```nội dung``` "));

        String description = validDescription().replace("3.200.000.000", "3200000000");
        assertDoesNotThrow(() -> validator.validate(objectMapper.writeValueAsString(
                java.util.Map.of("description", description))));
    }

    private String jsonWith(String prohibited) throws Exception {
        String description = validDescription();
        return objectMapper.writeValueAsString(java.util.Map.of(
                "description", prohibited + description.substring(prohibited.length())));
    }

    private void assertInvalid(String value) {
        AiDescriptionClientException error = assertThrows(AiDescriptionClientException.class,
                () -> validator.validate(value));
        assertEquals(AiDescriptionFailureType.INVALID_RESPONSE, error.getFailureType());
    }

    private String validDescription() {
        String first = "Căn hộ có diện tích 78 m², bố trí ba phòng ngủ và hai phòng tắm, phù hợp cho gia đình cần không gian sinh hoạt rõ ràng. Mức giá 3.200.000.000 đồng được trình bày theo thông tin người bán cung cấp. Ban công thoáng và nội thất mới là những điểm nổi bật được nhấn mạnh, giúp người xem dễ hình dung về nơi ở và cân nhắc theo nhu cầu thực tế.";
        String second = "Bất động sản nằm tại Quận 1, Thành phố Hồ Chí Minh, với địa chỉ và các đặc điểm được mô tả đúng theo biểu mẫu. Không gian hướng đến trải nghiệm ở tiện nghi, gọn gàng và dễ sắp xếp công năng. Người mua nên đối chiếu lại toàn bộ thông tin, hiện trạng và giấy tờ trong quá trình xem nhà để có quyết định phù hợp.";
        String value = first + "\n\n" + second;
        assertTrue(value.codePointCount(0, value.length()) >= 600);
        assertTrue(value.codePointCount(0, value.length()) <= 900);
        return value;
    }
}
