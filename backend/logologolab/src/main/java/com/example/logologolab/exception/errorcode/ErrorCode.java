package com.example.logologolab.exception.errorcode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    //400 BAD REQUEST
    INVALID_COURSE_TITLE(HttpStatus.BAD_REQUEST, "제목은 1자 이상 70자 이하로 입력해주세요."),
    INVALID_COURSE_RECOMMENDATION(HttpStatus.BAD_REQUEST, "추천도는 0부터 5까지의 값이어야 합니다."),
    INVALID_COURSE_PLACE_CONTENT(HttpStatus.BAD_REQUEST, "내용은 0자 이상 500자 이하로 입력해주세요."),
    INVALID_COURSE_PLACE_PHOTOS(HttpStatus.BAD_REQUEST, "사진 첨부는 최대 5개까지 가능합니다."),
    KEYWORD_REQUIRED(HttpStatus.BAD_REQUEST, "검색어를 입력해주세요."),

    //404 NOT FOUND
    OWNER_MISMATCH(HttpStatus.FORBIDDEN, "작성자만 수정 또는 삭제할 수 있습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    UNAUTHENTICATED_USER(HttpStatus.UNAUTHORIZED, "로그인이 필요한 요청입니다."),

    //500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 오류가 발생했습니다."),
    FILE_UPLOAD_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.");

    private final HttpStatus status;
    private final String message;

    public String getCode() {
        return this.name();
    }
}
