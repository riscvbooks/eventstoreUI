<script lang="ts">
    import { processMarkdownImages,codeCopy} from '$lib/docsify_plugin';
    import { onMount } from 'svelte';
    import { getContext ,afterUpdate} from'svelte';

    export let mdcontent;
    let compiledContent;

    onMount(async () => {


    
 

    });

    function formatTimestamp(timestamp) {
        if (String(timestamp).length < 13) {
            timestamp = timestamp * 1000;
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

   $: if (mdcontent) { 
 
        let precontent = processMarkdownImages(mdcontent);
        compiledContent = window.__current_docsify_compiler__.compile(precontent);
         
    }

    let container;
    
    afterUpdate(() => {
        if (container?.innerHTML) {
            codeCopy();
        }
    });

 
 

 

</script>

            <div class="md-content">
                <article class="markdown-section" id="main" bind:this={container}>
                     {@html compiledContent}
                </article>
            </div>