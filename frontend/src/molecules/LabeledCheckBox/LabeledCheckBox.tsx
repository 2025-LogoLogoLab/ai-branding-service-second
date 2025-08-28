// LabeledCheckBox.tsx

// 부모로부터 받을 props 타입 정의
type LabeledCheckBoxProps = {
  label: string; // 화면에 표시할 라벨 텍스트
  name: string; // 체크박스 고유 이름 (상태 식별용)
  checked: boolean; // 현재 체크 여부
  onChange: (name: string, checked: boolean) => void; // 체크 상태가 변경될 때 실행할 콜백
};

// 체크박스 컴포넌트 정의
function LabeledCheckBox ({ label, name, checked, onChange }: LabeledCheckBoxProps){
  
    // input 요소의 변경 이벤트를 처리하는 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 부모한테서 받은 onChange 호출해서 name과 변경된 checked 값을 부모에게 전달
        onChange(name, e.target.checked);
    };

    return (
        <label>
            {/* 체크박스 input 요소 */}
            <input
                type="checkbox"
                name={name}
                checked={checked} // 현재 체크 여부
                onChange={handleChange} // 변경 시 handleChange 호출
            />
            {/* 체크박스 옆에 표시될 텍스트 */}
            {label}
        </label>
    );
};

export default LabeledCheckBox;
