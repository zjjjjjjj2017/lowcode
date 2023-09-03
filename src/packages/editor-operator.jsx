import { defineComponent, inject, watch, reactive } from "vue";
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElColorPicker, ElSelect, ElOption, ElInput } from 'element-plus'
import deepcopy from "deepcopy";
import TableEditor from "./table-editor";

export default defineComponent({
    props: {
        block: { type: Object }, // 用户最后选中的元素
        data: { type: Object }, // 当前所有的数据
        updateContainer: { type: Function },
        updateBlock: { type: Function }
    },
    setup(props, ctx) {
        const config = inject('config'); // 注入组件的配置信息，在editor-config.jsx中导出的
        const state = reactive({
            editData: {}
        })
        const reset = () => {
            if (!props.block) { // 说明要绑定的是容器的宽度和高度
                state.editData = deepcopy(props.data.container)
            } else {
                state.editData = deepcopy(props.block);
                console.log(state.editData)
            }
        }
        const apply = () => {
            if (!props.block) { // 更改组件容器的大小
                props.updateContainer({ ...props.data, container: state.editData });
            } else { // 更改组件的配置
                props.updateBlock(state.editData, props.block);
            }

        }
        //immediate 的作用就是设置是否立即执行监控，
        //当我们将其值设置为 true 时，那么被监控的对象在初始化时就会触发一次 watch 方法，相当于页面一刷新就会触发。
        watch(() => props.block, reset, { immediate: true })
        return () => {
            let content = []
            if (!props.block) {//没有选中组件时，右侧显示容器属性
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
                </>)
            } else {//有组件被选中时，右侧显示组件属性
                let component = config.componentMap[props.block.key];
                if (component && component.props) { // {text:{type:'xxx'},size:{},color:{}}
                    // {text:xxx,size:13px,color:#fff}
                    content.push(Object.entries(component.props).map(([propName, propConfig]) => {//显示组件的所有配置项
                        return <ElFormItem label={propConfig.label}>
                            {{
                                input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                select: () => <ElSelect v-model={state.editData.props[propName]}>
                                    {propConfig.options.map(opt => {
                                        return <ElOption label={opt.label} value={opt.value}></ElOption>
                                    })}
                                </ElSelect>,
                                table: () => <TableEditor propConfig={propConfig} v-model={state.editData.props[propName]} ></TableEditor>
                            }[propConfig.type]()}
                        </ElFormItem>
                    }))
                }

                if (component && component.model) {
                    //                                                 default   标签名
                    content.push(Object.entries(component.model).map(([modelName, label]) => {
                        return <ElFormItem label={label}>
                            {/* model => {default:"username"} */}
                            <ElInput v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }

            }


            return <ElForm labelPosition="top" style="padding:30px">
                {content}
                <ElFormItem>
                    <ElButton type="primary" onClick={() => apply()}>应用</ElButton>
                    <ElButton onClick={reset} >重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})