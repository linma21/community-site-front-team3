import React, { useCallback, useEffect, useRef, useState } from "react";
import { createReactEditorJS } from "react-editor-js";
import { EDITOR_JS_TOOLS } from "./tool";
import { globalPath } from "globalPaths";
import axios from "axios";

const path = globalPath.path;

const Editor = ({ pageNo }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true); // 데이터 로딩 여부 

  console.log("Editor pageNo : ", pageNo);

  /** 제목 불러오기 */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const respPage = await axios.get(`${path}/page?pageNo=${pageNo}`);
        setTitle(respPage.data.title);
        console.log("ggg : ", respPage.data);
      } catch (error) {
        console.error("Error fetching page data: ", error);
      }
    };
    fetchPageData();
  }, [pageNo]);

  /** 블록 불러오기 */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const respBlock = await axios.get(`${path}/block?pageNo=${pageNo}`);
        console.log("블록 불러오기 : ", respBlock.data);
        setBlocks(respBlock.data.block || []); // 데이터가 없으면 빈 배열로 설정
        setLoading(false); // 로딩 상태 해제
      } catch (error) {
        console.error("블록 불러오기 오류 : ", error);
        setLoading(false);
      }
    };
    fetchPageData();
  }, [pageNo]);

  const ReactEditorJS = createReactEditorJS();

  // Editor.js 초기화 핸들러
  const handleInitialize = useCallback((instance) => {
    editorRef.current = instance;
  }, []);

  /** 저장하기 누르면 */
  const handleSave = useCallback(async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        console.log("Article data: ", outputData);

        const formData = new FormData();

        /** block 반복해서 이미지 블록 처리 */
        const processedBlocks = await Promise.all(
          outputData.blocks.map(async (block, index) => {
            // 이미지 블록이면
            if (
              block.type === "image" &&
              block.data.url.startsWith("data:image")
            ) {
              const imgFile = base64ToFile(
                block.data.url,
                `image_${index}.png`
              );

              const formData2 = new FormData();

              formData2.append("imgFile", imgFile);
              console.log(formData2);
              // 파일 객체 전송 및 저장명 받기
              try {
                const resp = await axios.post(
                  `${path}/page/upload`,
                  formData2,
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                const sName = resp.data; // 서버가 반환한 이미지 URL
                console.log("파일 전송 성공 sName : ", sName);
                console.log(
                  "파일 전송 성공 url : ",
                  `${path}/uploads/${sName}`
                );
                // URL을 사용하여 블록 데이터 업데이트
                return {
                  ...block,
                  data: {
                    ...block.data,
                    url: `${path}/uploads/${sName}`,
                  },
                  order: index,
                };
              } catch (err) {
                console.error("파일 전송 실패: ", err);
                throw new Error(`Image upload failed for block index ${index}`);
              }
            }
            // 이미지 블록이 아니면
            return { ...block, order: index }; 
          })
        );

        /** 이미지 변환 한 후 formData 저장 */
        const dataWithoutBase64 = {
          ...outputData,
          blocks: processedBlocks,
        };

        formData.append("data", JSON.stringify(dataWithoutBase64));
        formData.append("pageNo", pageNo);
        console.log("formData: ", formData);
        console.log("pageNo: ", pageNo);

        /** 본문 내용 전체 저장 */
        const response = await fetch(`${path}/savepage`, {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error("Saving failed: ", error);
      }
    }
  }, [editorRef, path]);

  /** Base64 -> 파일 */
  const base64ToFile = (blockDataUrl, fileName) => {
    const dataUrlArr = blockDataUrl.split(",");
    const mime = dataUrlArr[0].match(/:(.*?);/)[1];
    const bstr = atob(dataUrlArr[1]); // atob : Base64 decode
    let n = bstr.length;
    console.log("mime : " + mime);
    console.log(n);

    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // 데이터 로딩중이면 표시
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleBlock = () => {
    console.log(blocks);
  }

  return (
    <div className="Editor">
      <h1
        className="pageTitle"
        spellCheck="true"
        placeholder="제목 없음"
        contentEditable="true"
      >{title}</h1>
      <div id="test">
        <ReactEditorJS
          tools={EDITOR_JS_TOOLS}
          onInitialize={handleInitialize}
          data={{ blocks: blocks }} // defaultValue 대신 data를 사용
        />
      </div>
      <button onClick={handleSave}>저장</button>
      <button onClick={handleBlock}>블록출력</button>
    </div>
  );
};

export default Editor;
