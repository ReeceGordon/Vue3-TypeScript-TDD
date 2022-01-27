<template>
    <div class="columns">
        <div class="column">
            <div class="field">
                <div class="label">New Post</div>
                <input 
                v-model="title" 
                type="text" 
                class="input"
                data-test="title" />
            </div>
        </div>
    </div>

    <div class="columns">
        <div class="column">
            <div 
            contenteditable 
            id="markdown" 
            ref="contentEditable" 
            @input="handleInput"
            data-test="content"
             />
        </div>
        <div class="column">
            <div v-html="html" />
        </div>
    </div>

    <div class="columns">
        <div class="column">
            <button 
            @click="save" 
            class="button is-primary is-pulled-right"
            data-test="submit">
                Submit
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Post } from '../mocks';
import { defineComponent, onMounted, ref, watch, watchEffect } from 'vue';
import { parse } from 'marked'
import highlight from 'highlight.js'
import debounce from 'lodash/debounce'

export default defineComponent({
    props: {
        post: {
            type: Object as () => Post,
            required: true
        }
    },

    emits: {
        save: (post: Post) => {
            return true
        }
    },

    setup(props, ctx) {
        const title = ref(props.post.title)
        const content = ref('## Title\nEnter your post content...')
        const html = ref('')
        const contentEditable = ref<HTMLDivElement | null>(null)

        const parseHtml = (str: string) => {
            html.value = parse(str, {
                gfm: true,
                breaks: true,
                highlight: (code: string) => {
                    return highlight.highlightAuto(code).value
                }
            })
        }
        // debounce ensure we don't call our callback more often than the determine ms
        // in this case 250ms, functionally results in the preview not updating unless
        // we stop typing for at least 250ms
        watch(content, debounce((newVal) => {
            parseHtml(newVal)
        }, 250), { immediate: true})

        const handleInput = () => {
            if(!contentEditable.value) {
                throw Error('This should never happen.')
            }

            content.value = contentEditable.value.innerText || ''
        }

        onMounted(() => {
            if(!contentEditable.value) {
                throw Error('This should never happen.')
            }
            contentEditable.value.innerText = content.value
        })

        const save = () => {
            const newPost: Post = {
                ...props.post,
                title: title.value,
                html: html.value,
                markdown: content.value
            }

            ctx.emit('save', newPost)
        }

        return {
            html,
            title,
            content,
            handleInput,
            contentEditable,
            save
        }
    }
});
</script>

<style>
.column {
    overflow: auto;
}

#markdown {
  white-space: pre-wrap;
}
</style>
