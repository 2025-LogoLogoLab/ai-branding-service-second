// import { useState } from "react";
// import { TextButton } from "../atoms/TextButton/TextButton";
// import { TextInput } from "../atoms/TextInput/TextInput";
// import { TextArea } from "../atoms/TextArea/TextArea";
// import { MarkdownMessage } from "../atoms/MarkdownMessage/MarkdownMessage";
// import { Image } from "../atoms/Image/Image";
import reactLogo from '../assets/react.svg';
// import { LabeledInput } from "../molecules/LabeledInput/LabeledInput";
// import { FeatureCard } from "../molecules/FeatureCard/FeatureCard";
// import { IconButton } from "../atoms/IconButton/IconButton";
// import { ProductToolbar } from "../molecules/ProductToolbar/ProductToolbar";
import { LogoCard } from "../organisms/LogoCard/LogoCard";

// src/forTest/UItestPage.tsx
function Tester() {

  // const [ stateForTest, setStateForTest ] = useState<string>(''); 
    return (
      <div>
        {/* <TextButton label="오렌지" onClick={() => console.log('오렌지 버튼 클릭')} variant="orange" ></TextButton>
        <br></br>
        <TextButton label="화이트" onClick={() => console.log('화이트 버튼 클릭')} variant="white" ></TextButton>
        <br></br>
        <TextButton label="테두리" onClick={() => console.log('테두리 버튼 클릭')} variant="outlined" ></TextButton>
        <br></br>
        <TextInput value={stateForTest} onChange={(e) => setStateForTest(e.target.value)} placeholder="abcd@email.com" type="email" disabled={true} ></TextInput>
        <TextInput value={stateForTest} onChange={(e) => setStateForTest(e.target.value)} placeholder="abcd@email.com" type="email" disabled={false} ></TextInput>
        <TextInput value={stateForTest} onChange={(e) => setStateForTest(e.target.value)} placeholder="password" type="password" disabled={false} ></TextInput> */}
        {/* <TextArea value={stateForTest} onChange={(e) => setStateForTest(e.target.value)} onSubmit={() => console.log('제출')}></TextArea>
        <TextArea value={stateForTest} onChange={(e) => setStateForTest(e.target.value)} onSubmit={() => console.log('제출')} disabled={true}></TextArea> */}
        {/* <MarkdownMessage
          content={`**안녕하세요!**\n다음 정보를 바탕으로 브랜딩 전략을 생성해드릴게요.`}
        />

        <MarkdownMessage
          content={`이건 사용자 메시지입니다.`}
          isUser={true}
        /> */}

        {/* <div>
            <p>Thumbnail</p>
            <Image src={reactLogo} alt="React Logo" variant="thumbnail" />
        </div>
        <div>
            <p>Profile</p>
            <Image src={reactLogo} alt="React Logo" variant="profile" />
        </div>
        <div>
            <p>Banner</p>
            <Image src={reactLogo} alt="React Logo" variant="banner" />
        </div> */}
        {/* <LabeledInput
          label="이메일"
          labelFor="email"
          type="email"
          value={stateForTest}
          onChange={(e) => setStateForTest(e.target.value)}
          placeholder="이메일 입력"
        /> */}
        {/* <FeatureCard imageSrc={reactLogo} 
            imageAlt="대체" 
            title="테스트 카드" 
            description="feature카드 테스트 입니다" 
            buttonLabel="테스트 버튼" 
            onButtonClick={() => console.log('야호')} 
        /> */}
        {/* <IconButton iconSrc={reactLogo} alt='테스트버튼' onClick={() => console.log('클릭!!')}/>
        <br></br>
        <IconButton iconSrc={reactLogo} alt='테스트버튼' size={45} onClick={() => console.log('클릭!!')}/>
        <br></br>
        <ProductToolbar 
          id={0} 
          size={24}
          onDelete={(id:number) => console.log(id + '번 삭제')}
          onSave={(id:number) => console.log(id + '번 저장')}
          onDownload={(id:number) => console.log(id + '번 다운로드')}
          onTag={(id:number) => console.log(id + '번 태그 추가')}
          // onInsertToProject={(id:number) => console.log(id + '번 프로젝트에 추가')}
        />
        <ProductToolbar 
          id={2} 
          size={12}
          onDelete={(id:number) => console.log(id + '번 삭제')}
          onSave={(id:number) => console.log(id + '번 저장')}
          onDownload={(id:number) => console.log(id + '번 다운로드')}
          onTag={(id:number) => console.log(id + '번 태그 추가')}
          onInsertToProject={(id:number) => console.log(id + '번 프로젝트에 추가')}
        /> */}
        <LogoCard 
          id={10}
          logoBase64={reactLogo}
          onDelete={(id:number) => console.log(id + '번 삭제')}
          onSave={(id:number) => console.log(id + '번 저장')}
          onDownload={(id:number) => console.log(id + '번 다운로드')}
          onTag={(id:number) => console.log(id + '번 태그 추가')}
          onInsertToProject={(id:number) => console.log(id + '번 프로젝트에 추가')}
        />        
      </div>  
    );
}

export default Tester
